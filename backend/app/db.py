import os
import sqlite3
import logging
from contextlib import contextmanager
from typing import Generator, Any, Dict, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import settings

logger = logging.getLogger("uvicorn")

# Check whether we use PostgreSQL or SQLite
DATABASE_URL = settings.DATABASE_URL
USE_POSTGRES = False

if DATABASE_URL.startswith("postgresql"):
    try:
        # Test connecting directly with psycopg2
        # Strip '+psycopg2' if present from connection URL
        clean_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
        test_conn = psycopg2.connect(clean_url, connect_timeout=3)
        test_conn.close()
        USE_POSTGRES = True
        logger.info(f"Connected to PostgreSQL directly via psycopg2 at {clean_url}")
    except Exception as e:
        logger.warning(
            f"Could not connect to PostgreSQL ({e}). "
            "Falling back to local SQLite with raw SQL engine for smooth demo execution."
        )
        USE_POSTGRES = False

SQLITE_PATH = "ecommerce.db"

class DatabaseWrapper:
    def __init__(self, use_postgres: bool):
        self.use_postgres = use_postgres

    @contextmanager
    def get_connection(self):
        if self.use_postgres:
            clean_url = settings.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
            conn = psycopg2.connect(clean_url, cursor_factory=RealDictCursor)
            try:
                yield conn
            finally:
                conn.close()
        else:
            conn = sqlite3.connect(SQLITE_PATH)
            conn.row_factory = sqlite3.Row
            try:
                yield conn
            finally:
                conn.close()

    def format_query(self, query: str) -> str:
        """Adapts SQL parameter placeholders between PostgreSQL (%s) and SQLite (?)."""
        if not self.use_postgres:
            # Replace %s with ? for SQLite
            return query.replace("%s", "?")
        return query

    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            formatted_sql = self.format_query(query)
            cursor.execute(formatted_sql, params)
            rows = cursor.fetchall()
            if self.use_postgres:
                return [dict(r) for r in rows]
            else:
                return [dict(r) for r in rows]

    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            formatted_sql = self.format_query(query)
            cursor.execute(formatted_sql, params)
            row = cursor.fetchone()
            if row is None:
                return None
            return dict(row)

    def execute(self, query: str, params: tuple = ()) -> int:
        """Executes INSERT/UPDATE/DELETE and commits. Returns lastrowid or affected rows."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            formatted_sql = self.format_query(query)
            cursor.execute(formatted_sql, params)
            conn.commit()
            if not self.use_postgres:
                return cursor.lastrowid or cursor.rowcount
            else:
                return cursor.rowcount

db = DatabaseWrapper(use_postgres=USE_POSTGRES)

def init_db():
    """Initializes tables and indexes using raw native SQL DDL."""
    with db.get_connection() as conn:
        cursor = conn.cursor()

        if db.use_postgres:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                sku VARCHAR(100) UNIQUE NOT NULL,
                barcode VARCHAR(100),
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                subcategory VARCHAR(100),
                mrp DOUBLE PRECISION NOT NULL,
                selling_price DOUBLE PRECISION NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                image_url TEXT,
                specifications TEXT,
                rating DOUBLE PRECISION DEFAULT 4.5,
                rating_count INTEGER DEFAULT 120,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS ix_products_sku ON products(sku);
            CREATE INDEX IF NOT EXISTS ix_products_brand ON products(brand);
            CREATE INDEX IF NOT EXISTS ix_products_category ON products(category);
            CREATE INDEX IF NOT EXISTS ix_products_price ON products(selling_price);
            CREATE INDEX IF NOT EXISTS ix_products_name ON products(name);
            CREATE INDEX IF NOT EXISTS ix_product_category_price ON products(category, selling_price);

            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(100) PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50),
                shipping_address TEXT NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                total_amount DOUBLE PRECISION NOT NULL,
                discount_amount DOUBLE PRECISION DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(100) NOT NULL,
                product_id INTEGER NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DOUBLE PRECISION NOT NULL,
                subtotal DOUBLE PRECISION NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);
            """)
        else:
            conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT UNIQUE NOT NULL,
                barcode TEXT,
                name TEXT NOT NULL,
                brand TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT,
                mrp REAL NOT NULL,
                selling_price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                image_url TEXT,
                specifications TEXT,
                rating REAL DEFAULT 4.5,
                rating_count INTEGER DEFAULT 120,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS ix_products_sku ON products(sku);
            CREATE INDEX IF NOT EXISTS ix_products_brand ON products(brand);
            CREATE INDEX IF NOT EXISTS ix_products_category ON products(category);
            CREATE INDEX IF NOT EXISTS ix_products_price ON products(selling_price);
            CREATE INDEX IF NOT EXISTS ix_products_name ON products(name);
            CREATE INDEX IF NOT EXISTS ix_product_category_price ON products(category, selling_price);

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT,
                shipping_address TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                total_amount REAL NOT NULL,
                discount_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'Confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                subtotal REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);
            """)
        conn.commit()
        logger.info("Database tables and indexes initialized using pure raw SQL.")
