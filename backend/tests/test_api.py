import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db import db, init_db
from app.auth import get_password_hash

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()
    # Clean up test records
    db.execute("DELETE FROM products WHERE sku LIKE 'TEST-%'")
    db.execute("DELETE FROM users WHERE username = 'testadmin'")

    # Create test admin
    hashed = get_password_hash("adminpassword123")
    db.execute(
        "INSERT INTO users (username, hashed_password, role) VALUES (%s, %s, %s)",
        ("testadmin", hashed, "admin")
    )

    yield

    # Teardown clean up
    try:
        db.execute("DELETE FROM products WHERE sku LIKE 'TEST-%'")
        db.execute("DELETE FROM users WHERE username = 'testadmin'")
        # Ensure default admin user is always preserved/restored
        default_admin = db.fetch_one("SELECT id FROM users WHERE username = %s", ("admin",))
        if not default_admin:
            admin_hash = get_password_hash("admin123")
            db.execute(
                "INSERT INTO users (username, hashed_password, role) VALUES (%s, %s, %s)",
                ("admin", admin_hash, "admin")
            )
    except Exception:
        pass

def get_admin_token():
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "adminpassword123"}
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]

def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_login_invalid_credentials():
    resp = client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"}
    )
    assert resp.status_code == 401

def test_create_product_unauthorized():
    payload = {
        "sku": "TEST-SKU-01",
        "name": "Test Wireless Mouse",
        "brand": "Logitech",
        "category": "Electronics",
        "mrp": 1999.0,
        "selling_price": 1499.0,
        "stock": 5
    }
    resp = client.post("/api/admin/products", json=payload)
    assert resp.status_code in [401, 403]

def test_create_product_success_and_stock_rules():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test In Stock (stock = 5)
    payload_instock = {
        "sku": "TEST-SKU-INSTOCK",
        "name": "Mechanical Keyboard",
        "brand": "Keychron",
        "category": "Electronics",
        "mrp": 7999.0,
        "selling_price": 5999.0,
        "stock": 5,
        "image_url": "https://example.com/keyboard.jpg"
    }
    res1 = client.post("/api/admin/products", json=payload_instock, headers=headers)
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["stock_status"] == "In Stock"
    assert data1["can_add_to_cart"] is True
    assert data1["discount_percentage"] == 25.0

    # 2. Test Only Few Left (stock = 2)
    payload_few = {
        "sku": "TEST-SKU-FEW",
        "name": "Desk Mat",
        "brand": "Keychron",
        "category": "Accessories",
        "mrp": 1500.0,
        "selling_price": 1200.0,
        "stock": 2
    }
    res2 = client.post("/api/admin/products", json=payload_few, headers=headers)
    assert res2.status_code == 201
    assert res2.json()["stock_status"] == "Only Few Left"
    assert res2.json()["can_add_to_cart"] is True

    # 3. Test Out of Stock (stock = 0)
    payload_oos = {
        "sku": "TEST-SKU-OOS",
        "name": "USB-C Hub",
        "brand": "Anker",
        "category": "Electronics",
        "mrp": 3000.0,
        "selling_price": 2500.0,
        "stock": 0
    }
    res3 = client.post("/api/admin/products", json=payload_oos, headers=headers)
    assert res3.status_code == 201
    assert res3.json()["stock_status"] == "Out of Stock"
    assert res3.json()["can_add_to_cart"] is False

def test_data_validation_selling_price_greater_than_mrp():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "sku": "INVALID-PRICE",
        "name": "Overpriced Item",
        "brand": "Acme",
        "category": "General",
        "mrp": 1000.0,
        "selling_price": 1500.0,  # Invalid: selling > mrp
        "stock": 10
    }
    resp = client.post("/api/admin/products", json=payload, headers=headers)
    assert resp.status_code == 422

def test_data_validation_negative_stock():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "sku": "INVALID-STOCK",
        "name": "Negative Inventory Item",
        "brand": "Acme",
        "category": "General",
        "mrp": 1000.0,
        "selling_price": 900.0,
        "stock": -5  # Invalid: negative stock
    }
    resp = client.post("/api/admin/products", json=payload, headers=headers)
    assert resp.status_code == 422

def test_duplicate_sku_rejection():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "sku": "TEST-SKU-INSTOCK",  # Already created above
        "name": "Another item",
        "brand": "Keychron",
        "category": "Electronics",
        "mrp": 5000.0,
        "selling_price": 4000.0,
        "stock": 3
    }
    resp = client.post("/api/admin/products", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "already exists" in resp.json()["detail"]

def test_pagination_and_filtering():
    # Search
    resp = client.get("/api/products?search=Keyboard")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) >= 1
    assert any("Keyboard" in item["name"] for item in data["items"])

    # Brand filter
    resp = client.get("/api/products?brand=Anker")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) >= 1
    assert all(item["brand"] == "Anker" for item in data["items"])

    # Category filter
    resp = client.get("/api/products?category=Accessories")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) >= 1
    assert all(item["category"] == "Accessories" for item in data["items"])

    # Sorting by price
    resp = client.get("/api/products?sort_by=price_asc")
    assert resp.status_code == 200
    items = resp.json()["items"]
    prices = [p["selling_price"] for p in items]
    assert prices == sorted(prices)

def test_similar_and_recommended_products():
    resp = client.get("/api/products?search=Keyboard")
    item_id = resp.json()["items"][0]["id"]

    sim_resp = client.get(f"/api/products/{item_id}/similar")
    assert sim_resp.status_code == 200
    assert isinstance(sim_resp.json(), list)

    rec_resp = client.get(f"/api/products/{item_id}/recommendations")
    assert rec_resp.status_code == 200
    assert isinstance(rec_resp.json(), list)

def test_admin_patch_stock_and_delete():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get created item
    resp = client.get("/api/products?search=Keyboard")
    item_id = resp.json()["items"][0]["id"]

    # Patch stock from 5 to 1 (becomes "Only Few Left")
    patch_resp = client.patch(f"/api/admin/products/{item_id}/stock", json={"stock": 1}, headers=headers)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["stock"] == 1
    assert patch_resp.json()["stock_status"] == "Only Few Left"

    # Delete product
    del_resp = client.delete(f"/api/admin/products/{item_id}", headers=headers)
    assert del_resp.status_code == 200

    # Verify not found
    get_resp = client.get(f"/api/products/{item_id}")
    assert get_resp.status_code == 404

def test_check_inventory():
    # Pick any existing product
    resp = client.get("/api/products?page=1&page_size=1")
    assert resp.status_code == 200
    items = resp.json()["items"]
    if items:
        pid = items[0]["id"]
        inv_resp = client.get(f"/api/products/{pid}/inventory")
        assert inv_resp.status_code == 200
        inv = inv_resp.json()
        assert "stock" in inv
        assert "stock_status" in inv
        assert "can_add_to_cart" in inv
        assert inv["stock_status"] in ("In Stock", "Only Few Left", "Out of Stock")
