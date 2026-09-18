import math
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status

from app.db import db
from app.schemas import (
    ProductResponse,
    PaginatedProductsResponse,
    FilterMetadataResponse,
    compute_stock_status,
    compute_discount_percentage,
)

router = APIRouter(prefix="/api/products", tags=["Products"])

def format_product_dict(p: Dict[str, Any]) -> ProductResponse:
    """Helper to convert a native SQL row dictionary to a ProductResponse with computed fields."""
    stock = p.get("stock", 0)
    mrp = float(p.get("mrp", 0.0))
    selling_price = float(p.get("selling_price", 0.0))

    stock_status, can_add = compute_stock_status(stock)
    discount_pct = compute_discount_percentage(mrp, selling_price)
    
    # Parse specifications if JSON string
    specs_raw = p.get("specifications")
    specs_dict = None
    if specs_raw:
        try:
            specs_dict = json.loads(specs_raw)
        except Exception:
            specs_dict = {"Details": str(specs_raw)}

    return ProductResponse(
        id=p["id"],
        sku=p["sku"],
        barcode=p.get("barcode"),
        name=p["name"],
        brand=p["brand"],
        category=p["category"],
        subcategory=p.get("subcategory"),
        mrp=mrp,
        selling_price=selling_price,
        stock=stock,
        image_url=p.get("image_url"),
        specifications=specs_raw,
        specifications_dict=specs_dict,
        rating=float(p.get("rating") or 4.5),
        rating_count=int(p.get("rating_count") or 120),
        discount_percentage=discount_pct,
        stock_status=stock_status,
        can_add_to_cart=can_add,
        created_at=str(p.get("created_at")),
        updated_at=str(p.get("updated_at")),
    )

@router.get("", response_model=PaginatedProductsResponse)
def list_products(
    search: Optional[str] = Query(None, description="Search term for name, brand, or SKU"),
    brand: Optional[str] = Query(None, description="Filter by brand name (comma-separated for multi)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum selling price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum selling price"),
    sort_by: Optional[str] = Query(
        "created_desc", 
        description="Sort by: price_asc, price_desc, name_asc, name_desc, created_desc"
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(8, ge=1, le=100, description="Number of items per page"),
):
    """
    Get paginated, filtered, and sorted products catalog using native SQL queries.
    Leverages indexed columns (brand, category, selling_price, sku, name).
    """
    where_clauses = ["1=1"]
    params: List[Any] = []

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        where_clauses.append("(name LIKE %s OR brand LIKE %s OR sku LIKE %s OR category LIKE %s)")
        params.extend([term, term, term, term])

    # Brand filter (supports comma-separated list)
    if brand and brand.strip():
        brands = [b.strip() for b in brand.split(",") if b.strip()]
        if len(brands) == 1:
            where_clauses.append("brand = %s")
            params.append(brands[0])
        elif len(brands) > 1:
            placeholders = ", ".join(["%s"] * len(brands))
            where_clauses.append(f"brand IN ({placeholders})")
            params.extend(brands)

    # Category filter
    if category and category.strip():
        where_clauses.append("category = %s")
        params.append(category.strip())

    # Price range filter
    if min_price is not None:
        where_clauses.append("selling_price >= %s")
        params.append(min_price)
    if max_price is not None:
        where_clauses.append("selling_price <= %s")
        params.append(max_price)

    where_sql = " AND ".join(where_clauses)

    # Count total
    count_sql = f"SELECT COUNT(*) as total FROM products WHERE {where_sql}"
    count_row = db.fetch_one(count_sql, tuple(params))
    total = count_row["total"] if count_row else 0
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    # Sorting
    order_clause = "ORDER BY id DESC"
    if sort_by == "price_asc":
        order_clause = "ORDER BY selling_price ASC"
    elif sort_by == "price_desc":
        order_clause = "ORDER BY selling_price DESC"
    elif sort_by == "name_asc":
        order_clause = "ORDER BY name ASC"
    elif sort_by == "name_desc":
        order_clause = "ORDER BY name DESC"

    # Pagination LIMIT & OFFSET
    offset = (page - 1) * page_size
    query_sql = f"SELECT * FROM products WHERE {where_sql} {order_clause} LIMIT %s OFFSET %s"
    query_params = tuple(params + [page_size, offset])

    rows = db.fetch_all(query_sql, query_params)
    items = [format_product_dict(r) for r in rows]

    return PaginatedProductsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )

@router.get("/filters/meta", response_model=FilterMetadataResponse)
def get_filter_metadata():
    """
    Returns unique brands, categories, total products, and price ranges
    using raw SQL aggregation queries.
    """
    brand_rows = db.fetch_all("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != '' ORDER BY brand")
    brands = [r["brand"] for r in brand_rows]

    cat_rows = db.fetch_all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category")
    categories = [r["category"] for r in cat_rows]

    agg_row = db.fetch_one("SELECT COUNT(*) as total, MIN(selling_price) as min_p, MAX(selling_price) as max_p FROM products")
    total = agg_row["total"] if agg_row else 0
    min_price = float(agg_row["min_p"] or 0.0) if agg_row else 0.0
    max_price = float(agg_row["max_p"] or 0.0) if agg_row else 0.0

    return FilterMetadataResponse(
        brands=brands,
        categories=categories,
        total_products=total,
        min_price=min_price,
        max_price=max_price,
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    """Get single product details by primary key ID via native SQL."""
    row = db.fetch_one("SELECT * FROM products WHERE id = %s", (product_id,))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} was not found",
        )
    return format_product_dict(row)

@router.get("/by-sku/{sku}", response_model=ProductResponse)
def get_product_by_sku(sku: str):
    """Get single product details by unique SKU."""
    row = db.fetch_one("SELECT * FROM products WHERE sku = %s", (sku,))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with SKU '{sku}' was not found",
        )
    return format_product_dict(row)

@router.get("/{product_id}/similar", response_model=List[ProductResponse])
def get_similar_products(product_id: int):
    """Get up to 4 similar products based on category for the Figma PDP sidebar."""
    current = db.fetch_one("SELECT category FROM products WHERE id = %s", (product_id,))
    if not current:
        return []
    rows = db.fetch_all(
        "SELECT * FROM products WHERE category = %s AND id != %s LIMIT 4",
        (current["category"], product_id)
    )
    return [format_product_dict(r) for r in rows]

@router.get("/{product_id}/recommendations", response_model=List[ProductResponse])
def get_recommendations(product_id: int):
    """Get up to 5 recommended products for the 'You May Also Like' carousel in Figma."""
    rows = db.fetch_all("SELECT * FROM products WHERE id != %s ORDER BY id DESC LIMIT 5", (product_id,))
    return [format_product_dict(r) for r in rows]

@router.get("/{product_id}/inventory")
def check_inventory(product_id: int):
    """Check stock and availability for a specific product."""
    row = db.fetch_one("SELECT id, sku, stock FROM products WHERE id = %s", (product_id,))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    stock_status, can_add = compute_stock_status(row["stock"])
    return {
        "product_id": row["id"],
        "sku": row["sku"],
        "stock": row["stock"],
        "stock_status": stock_status,
        "can_add_to_cart": can_add,
    }
