from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.db import db
from app.schemas import LoginRequest, TokenResponse, UserResponse
from app.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest):
    """Authenticate admin or user and return JWT access token using native SQL."""
    user = db.fetch_one("SELECT * FROM users WHERE username = %s", (login_data.username,))
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        username=user["username"],
        role=user["role"],
    )

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get profile of current authenticated user."""
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        role=current_user["role"],
    )
