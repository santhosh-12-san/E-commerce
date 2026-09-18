import io
import csv
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from app.db import db
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    StockUpdate,
)
from app.auth import get_current_admin
from app.routers.products import format_product_dict

router = APIRouter(prefix="/api/admin/products", tags=["Admin Products Management"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Admin-only endpoint to create a new product using native SQL.
    Validates duplicate SKU, negative inventory, and selling_price <= mrp.
    """
    # Check duplicate SKU
    existing = db.fetch_one("SELECT id FROM products WHERE sku = %s", (payload.sku,))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A product with SKU '{payload.sku}' already exists.",
        )

    # Insert product
    insert_sql = """
    INSERT INTO products (
        sku, barcode, name, brand, category, subcategory, mrp, selling_price,
        stock, image_url, specifications, rating, rating_count
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        payload.sku,
        payload.barcode,
        payload.name,
        payload.brand,
        payload.category,
        payload.subcategory,
        payload.mrp,
        payload.selling_price,
        payload.stock,
        payload.image_url,
        payload.specifications,
        payload.rating or 4.5,
        payload.rating_count or 120,
    )
    db.execute(insert_sql, params)

    # Fetch created row
    created = db.fetch_one("SELECT * FROM products WHERE sku = %s", (payload.sku,))
    if not created:
        raise HTTPException(status_code=500, detail="Failed to retrieve created product")

    return format_product_dict(created)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """Admin-only endpoint to update an existing product using native SQL."""
    product = db.fetch_one("SELECT * FROM products WHERE id = %s", (product_id,))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} was not found",
        )

    # If SKU is updated, check uniqueness
    if payload.sku and payload.sku != product["sku"]:
        existing = db.fetch_one("SELECT id FROM products WHERE sku = %s", (payload.sku,))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A product with SKU '{payload.sku}' already exists.",
            )

    # Price validation when updating
    new_mrp = payload.mrp if payload.mrp is not None else product["mrp"]
    new_price = payload.selling_price if payload.selling_price is not None else product["selling_price"]
    if new_price > new_mrp:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Selling price cannot be greater than MRP",
        )

    updated_sku = payload.sku if payload.sku is not None else product["sku"]
    updated_barcode = payload.barcode if payload.barcode is not None else product.get("barcode")
    updated_name = payload.name if payload.name is not None else product["name"]
    updated_brand = payload.brand if payload.brand is not None else product["brand"]
    updated_category = payload.category if payload.category is not None else product["category"]
    updated_subcategory = payload.subcategory if payload.subcategory is not None else product.get("subcategory")
    updated_mrp = new_mrp
    updated_price = new_price
    updated_stock = payload.stock if payload.stock is not None else product["stock"]
    updated_img = payload.image_url if payload.image_url is not None else product.get("image_url")
    updated_specs = payload.specifications if payload.specifications is not None else product.get("specifications")
    updated_rating = payload.rating if payload.rating is not None else product.get("rating", 4.5)
    updated_count = payload.rating_count if payload.rating_count is not None else product.get("rating_count", 120)

    update_sql = """
    UPDATE products SET
        sku = %s, barcode = %s, name = %s, brand = %s, category = %s, subcategory = %s,
        mrp = %s, selling_price = %s, stock = %s, image_url = %s, specifications = %s,
        rating = %s, rating_count = %s, updated_at = CURRENT_TIMESTAMP
    WHERE id = %s
    """
    db.execute(update_sql, (
        updated_sku, updated_barcode, updated_name, updated_brand, updated_category,
        updated_subcategory, updated_mrp, updated_price, updated_stock, updated_img,
        updated_specs, updated_rating, updated_count, product_id
    ))

    refreshed = db.fetch_one("SELECT * FROM products WHERE id = %s", (product_id,))
    return format_product_dict(refreshed)

@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_stock(
    product_id: int,
    payload: StockUpdate,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """Admin-only quick stock count update using native SQL."""
    product = db.fetch_one("SELECT id FROM products WHERE id = %s", (product_id,))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    db.execute("UPDATE products SET stock = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (payload.stock, product_id))
    refreshed = db.fetch_one("SELECT * FROM products WHERE id = %s", (product_id,))
    return format_product_dict(refreshed)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: int,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """Admin-only endpoint to delete a product using native SQL."""
    product = db.fetch_one("SELECT id FROM products WHERE id = %s", (product_id,))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    db.execute("DELETE FROM products WHERE id = %s", (product_id,))
    return {"message": f"Product {product_id} deleted successfully"}

@router.post("/import-csv")
async def import_products_csv(
    file: UploadFile = File(...),
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Import products in bulk from a CSV file.
    Expected headers: sku, name, brand, category, subcategory, mrp, selling_price, stock, image_url, barcode
    """
    contents = await file.read()
    decoded = contents.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    
    imported_count = 0
    updated_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        try:
            sku = row.get("sku", "").strip()
            name = row.get("name", "").strip()
            brand = row.get("brand", "").strip()
            category = row.get("category", "").strip()
            if not sku or not name or not brand or not category:
                errors.append(f"Row {row_idx}: Missing required fields (sku, name, brand, category)")
                continue

            mrp = float(row.get("mrp", 0))
            selling_price = float(row.get("selling_price", 0))
            if selling_price > mrp:
                errors.append(f"Row {row_idx} ({sku}): Selling price cannot exceed MRP")
                continue

            stock = max(0, int(row.get("stock", 0)))
            barcode = row.get("barcode", "").strip() or None
            subcategory = row.get("subcategory", "").strip() or None
            image_url = row.get("image_url", "").strip() or None

            existing = db.fetch_one("SELECT id FROM products WHERE sku = %s", (sku,))
            if existing:
                db.execute(
                    """
                    UPDATE products SET
                        barcode = %s, name = %s, brand = %s, category = %s,
                        subcategory = %s, mrp = %s, selling_price = %s, stock = %s,
                        image_url = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE sku = %s
                    """,
                    (barcode, name, brand, category, subcategory, mrp, selling_price, stock, image_url, sku)
                )
                updated_count += 1
            else:
                db.execute(
                    """
                    INSERT INTO products (
                        sku, barcode, name, brand, category, subcategory,
                        mrp, selling_price, stock, image_url
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (sku, barcode, name, brand, category, subcategory, mrp, selling_price, stock, image_url)
                )
                imported_count += 1
        except Exception as e:
            errors.append(f"Row {row_idx}: {str(e)}")

    return {
        "success": True,
        "imported": imported_count,
        "updated": updated_count,
        "errors": errors,
        "message": f"Successfully processed {imported_count + updated_count} products."
    }

