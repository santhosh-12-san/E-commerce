from datetime import datetime
from typing import Optional, Any, Dict, List, Union
import json
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict

class StockStatusEnum(str):
    OUT_OF_STOCK = "Out of Stock"
    ONLY_FEW_LEFT = "Only Few Left"
    IN_STOCK = "In Stock"

def compute_stock_status(stock: Union[int, float, str]) -> tuple[str, bool]:
    """
    Computes stock status badge and whether it can be added to cart.
    Stock = 0 -> 'Out of Stock' (disabled)
    Stock in [1, 2] -> 'Only Few Left' (enabled)
    Stock >= 3 -> 'In Stock' (enabled)
    """
    try:
        s = int(stock)
    except (ValueError, TypeError):
        s = 0

    if s <= 0:
        return "Out of Stock", False
    elif s in (1, 2):
        return "Only Few Left", True
    else:
        return "In Stock", True

def compute_discount_percentage(mrp: float, selling_price: float) -> float:
    """Computes discount percentage rounded to 1 decimal place."""
    if mrp > 0 and mrp >= selling_price:
        return round(((mrp - selling_price) / mrp) * 100, 1)
    return 0.0

# Base Product Schema
class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100, description="Unique SKU code")
    barcode: Optional[str] = Field(None, max_length=100, description="Barcode/UPC/EAN")
    name: str = Field(..., min_length=1, max_length=255, description="Product title")
    brand: str = Field(..., min_length=1, max_length=100, description="Brand name")
    category: str = Field(..., min_length=1, max_length=100, description="Category")
    subcategory: Optional[str] = Field(None, max_length=100, description="Subcategory")
    mrp: float = Field(..., ge=0, description="Maximum Retail Price")
    selling_price: float = Field(..., ge=0, description="Current selling price")
    stock: int = Field(0, ge=0, description="Available inventory count")
    image_url: Optional[str] = Field(None, description="Image URL")
    specifications: Optional[str] = Field(None, description="Specifications as JSON or plain text")
    rating: Optional[float] = Field(4.5, ge=1.0, le=5.0, description="Product review rating")
    rating_count: Optional[int] = Field(120, ge=0, description="Number of ratings")

    @field_validator("sku", "name", "brand", "category")
    @classmethod
    def not_empty_string(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or whitespace only")
        return v.strip()

    @model_validator(mode="after")
    def validate_pricing_and_inventory(self):
        if self.selling_price > self.mrp:
            raise ValueError(
                f"Selling price ({self.selling_price}) cannot be greater than MRP ({self.mrp})"
            )
        if self.stock < 0:
            raise ValueError("Stock inventory cannot be negative")
        return self

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    barcode: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    subcategory: Optional[str] = None
    mrp: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    specifications: Optional[str] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None

    @model_validator(mode="after")
    def validate_update_pricing(self):
        if self.mrp is not None and self.selling_price is not None:
            if self.selling_price > self.mrp:
                raise ValueError("Selling price cannot be greater than MRP")
        return self

class StockUpdate(BaseModel):
    stock: int = Field(..., ge=0, description="New stock count (must be >= 0)")

class ProductResponse(BaseModel):
    id: int
    sku: str
    barcode: Optional[str] = None
    name: str
    brand: str
    category: str
    subcategory: Optional[str] = None
    mrp: float
    selling_price: float
    stock: int
    image_url: Optional[str] = None
    specifications: Optional[str] = None
    specifications_dict: Optional[Dict[str, Any]] = None
    rating: Optional[float] = 4.5
    rating_count: Optional[int] = 120
    discount_percentage: float
    stock_status: str
    can_add_to_cart: bool
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]

    model_config = ConfigDict(from_attributes=True)

class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

class FilterMetadataResponse(BaseModel):
    brands: List[str]
    categories: List[str]
    total_products: int
    min_price: float
    max_price: float

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    model_config = ConfigDict(from_attributes=True)
