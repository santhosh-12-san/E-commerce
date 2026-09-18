import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Depends, status

from app.db import db
from app.auth import get_current_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)

class CreateOrderRequest(BaseModel):
    customer_name: str = Field(..., min_length=1)
    customer_email: str = Field(..., min_length=3)
    customer_phone: Optional[str] = None
    shipping_address: str = Field(..., min_length=5)
    payment_method: str = Field("UPI", description="UPI, Card, NetBanking, COD")
    discount_amount: float = Field(0.0, ge=0)
    items: List[OrderItemInput] = Field(..., min_length=1)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(payload: CreateOrderRequest):
    """
    Creates a new customer order, checks and decrements inventory in products table,
    and returns full order confirmation with generated order ID.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    # Generate Order ID
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    # Verify all products and stock
    order_items_data = []
    total_amount = 0.0

    for item in payload.items:
        product = db.fetch_one("SELECT id, name, selling_price, stock FROM products WHERE id = %s", (item.product_id,))
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID {item.product_id} not found"
            )
        
        current_stock = int(product["stock"])
        if current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product['name']}'. Only {current_stock} available."
            )

        unit_price = float(product["selling_price"])
        subtotal = round(unit_price * item.quantity, 2)
        total_amount += subtotal

        order_items_data.append({
            "product_id": product["id"],
            "product_name": product["name"],
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
        })

    # Apply discount
    final_total = max(0.0, round(total_amount - payload.discount_amount, 2))

    # Insert into orders table
    db.execute(
        """
        INSERT INTO orders (
            id, customer_name, customer_email, customer_phone,
            shipping_address, payment_method, total_amount, discount_amount, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            order_id,
            payload.customer_name.strip(),
            payload.customer_email.strip(),
            payload.customer_phone or "",
            payload.shipping_address.strip(),
            payload.payment_method,
            final_total,
            payload.discount_amount,
            "Confirmed"
        )
    )

    # Insert items and decrement product inventory
    for it in order_items_data:
        db.execute(
            """
            INSERT INTO order_items (
                order_id, product_id, product_name, quantity, unit_price, subtotal
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                order_id,
                it["product_id"],
                it["product_name"],
                it["quantity"],
                it["unit_price"],
                it["subtotal"]
            )
        )
        # Deduct stock
        db.execute(
            "UPDATE products SET stock = stock - %s WHERE id = %s",
            (it["quantity"], it["product_id"])
        )

    return {
        "order_id": order_id,
        "status": "Confirmed",
        "customer_name": payload.customer_name,
        "customer_email": payload.customer_email,
        "shipping_address": payload.shipping_address,
        "payment_method": payload.payment_method,
        "subtotal": total_amount,
        "discount_amount": payload.discount_amount,
        "total_amount": final_total,
        "items": order_items_data,
        "message": "Order created successfully and inventory updated."
    }

@router.get("/{order_id}")
def get_order(order_id: str):
    """Fetches details of a specific order."""
    order = db.fetch_one("SELECT * FROM orders WHERE id = %s", (order_id,))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    items = db.fetch_all("SELECT * FROM order_items WHERE order_id = %s", (order_id,))
    return {**order, "items": items}

@router.get("/admin/all")
def list_admin_orders(admin: dict = Depends(get_current_admin)):
    """Admin endpoint to view all orders and customer details."""
    orders = db.fetch_all("SELECT * FROM orders ORDER BY created_at DESC")
    results = []
    for ord_row in orders:
        items = db.fetch_all("SELECT * FROM order_items WHERE order_id = %s", (ord_row["id"],))
        results.append({**ord_row, "items": items})
    return results
