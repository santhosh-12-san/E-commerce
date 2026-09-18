import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db, db
from app.auth import get_password_hash
from app.routers import auth, products, admin, orders

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and indexes using native SQL
    logger.info("Initializing database tables and indexes with native SQL...")
    init_db()

    # Ensure default admin user exists
    try:
        admin_user = db.fetch_one("SELECT id FROM users WHERE username = %s", (settings.DEFAULT_ADMIN_USERNAME,))
        if not admin_user:
            logger.info(f"Creating default admin user: {settings.DEFAULT_ADMIN_USERNAME}")
            hashed = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)
            db.execute(
                "INSERT INTO users (username, hashed_password, role) VALUES (%s, %s, %s)",
                (settings.DEFAULT_ADMIN_USERNAME, hashed, "admin")
            )
            logger.info("Default admin user created successfully.")
    except Exception as e:
        logger.error(f"Error during admin user initialization: {e}")

    yield

app = FastAPI(
    title="ShopNest API",
    version=settings.VERSION,
    description="ShopNest E-Commerce REST API built with FastAPI, Native PostgreSQL, and JWT Authentication",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(admin.router)
app.include_router(orders.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "message": "ShopNest API is running",
        "version": settings.VERSION,
        "database": "PostgreSQL (Native SQL Engine)" if db.use_postgres else "SQLite (Native SQL Fallback)",
        "docs_url": "/docs",
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "database": "native_sql"}
