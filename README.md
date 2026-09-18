# ShopNest - Mini Ecommerce Full-Stack Application

A responsive, high-performance Mini Ecommerce web application built using **FastAPI (Python)**, **Direct Native PostgreSQL** (native SQL with psycopg2 and zero SQLAlchemy ORM), **Next.js (React / TypeScript / Tailwind CSS)**, and **JWT Authentication**.

This application was engineered according to the Website Developer Technical Assessment specifications, incorporating server-side pagination, database indexing, strict data validation, ecommerce inventory rules, an authenticated Admin Portal, and a `seeds.py` data populator with 50 realistic products.

---

## 🚀 Key Features

### 1. Product Listing & Discovery (`/`)
- **Responsive Layout**: Fluid grid design supporting mobile, tablet, and desktop screens.
- **Server-Side Pagination**: Efficient limit/offset pagination with total count and page indicators.
- **Instant Search**: Case-insensitive search across Product Title, Brand, Category, and SKU.
- **Multi-Faceted Filtering**: Dynamic sidebar filtering by Brand and Category.
- **Price & Name Sorting**: Sort by Newest, Price (Low to High), Price (High to Low), Name (A-Z), Name (Z-A).
- **Stock Status Badges**:
  - `Stock = 0`: **Out of Stock** (Red badge; "Add to Cart" button automatically disabled).
  - `Stock = 1 or 2`: **Only Few Left** (Amber pulsing badge; purchasing enabled).
  - `Stock >= 3`: **In Stock** (Emerald badge; purchasing enabled).
- **Discount Computation**: Automatically calculates and displays percentage discount saved against MRP (`((MRP - Selling Price) / MRP) * 100`).

### 2. Product Detail Page (`/products/[id]`)
- High-resolution product showcase and thumbnail viewing.
- Detailed price breakdown displaying MRP, Selling Price, and total savings.
- Product identification metadata: SKU, Barcode, Category, Subcategory.
- Structured **Product Specifications** key-value table.
- Interactive **Quantity Selector** strictly constrained by remaining available stock.
- Instant feedback when adding items to cart or when stock limit is reached.

### 3. Shopping Cart (`/cart`)
- Persistent client-side cart backed by browser `localStorage`.
- Real-time calculations:
  - **Subtotal (MRP)**
  - **Total Discount Saved**
  - **Final Payable Amount**
- Quantity adjustment steppers that strictly prohibit ordering beyond available inventory.
- Item removal, empty state handling, and promo code support (e.g. `WELCOME500`).
- Interactive Mock Checkout flow.

### 4. Admin Management Portal (`/admin`)
- **Secure JWT Authentication**: Protected endpoints utilizing bcrypt password hashing and JSON Web Tokens.
- **Inventory Metrics Dashboard**: Overview cards tracking total products, in-stock count, low-stock count, and out-of-stock items.
- **Manual Product Creation (`/admin/new`)**: Direct form to add products without manual code seeding:
  - Validates `Selling Price <= MRP`.
  - Validates `Stock >= 0`.
  - Validates SKU uniqueness.
  - Dynamic specifications builder.
- **Inline Quick Stock Editor**: One-click `+` / `-` stock adjustments directly inside the table.
- **Pure Manual Creation**: Products and attributes are added exclusively through the authenticated Admin UI (`/admin/new`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript | Server & Client Components, Responsive App Router |
| **Styling** | Tailwind CSS, Lucide React Icons | Modern, clean, responsive UI system |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance RESTful API & validation schemas |
| **Database** | PostgreSQL / SQLAlchemy 2.0 ORM | Relational database with B-Tree indexes & SQLite fallback |
| **Security** | Python-Jose (JWT), Passlib / Bcrypt | Secure token-based authentication & password hashing |
| **Containerization**| Docker & Docker Compose | Multi-container orchestration (Postgres, Backend, Frontend) |

### Database Indexing & Optimization Strategy
To ensure sub-millisecond query performance during high traffic, database indexes are placed on:
- `sku`: Unique B-Tree index for fast single-item lookups.
- `brand`: B-Tree index for instantaneous brand filtering.
- `category`: B-Tree index for category filtering.
- `selling_price`: B-Tree index for price range queries and sorting (`price_asc`, `price_desc`).
- `name`: B-Tree index for text prefix and keyword searches.
- Composite Index `(category, selling_price)`: Accelerates sorted category views.

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- *(Optional)* Docker Desktop if running PostgreSQL via containers

---

### Method A: Quick Local Startup (Zero-Config)

#### 1. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database tests to verify setup
python -m pytest -v

# Start FastAPI server (runs on http://127.0.0.1:8000)
python run.py
```
> *Note: If PostgreSQL is not active on your machine, the backend will automatically initialize a local SQLite database (`ecommerce.db`) so the application works immediately.*

#### 2. Frontend Setup
In a separate terminal:
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open your browser to **http://localhost:3000** to view the store!

---

### Method B: Docker Compose (Full PostgreSQL Stack)

To run the complete production-like stack (PostgreSQL + FastAPI + Next.js):
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend API & Swagger Docs: http://localhost:8000/docs
- PostgreSQL: `localhost:5432`

---

## 🔑 Admin Credentials & Initial Data

- **Admin Login URL**: http://localhost:3000/admin/login
- **Default Username**: `admin`
- **Default Password**: `admin123`

### 📦 Seeding 50 Products (`seeds.py`)
To populate the database with **50 realistic products** across categories (Electronics, Audio, Wearables, Cameras, Footwear, Fashion, Home & Kitchen, Personal Care) with exact stock distribution:

```bash
# Run from project root:
python seeds.py

# Or run from backend directory:
cd backend
python seeds.py
```

**Stock Rules Demonstrated in Seed Data**:
- **Out of Stock (`stock = 0`)**: 5 products — Displays red `Out of Stock` badge and disables "Add to Cart".
- **Only Few Left (`stock = 1 or 2`)**: 11 products — Displays amber `Only Few Left` badge and allows customer purchase.
- **In Stock (`stock >= 3`)**: 34 products — Displays emerald `In Stock` badge and allows customer purchase.

### Manual Product Creation via Admin UI
You can also manually add new products at any time:
1. Log in to the **Admin Portal** (`http://localhost:3000/admin/login`).
2. Navigate to **"Add New Product"** (`http://localhost:3000/admin/new`).
3. Fill out the validated form (SKU, barcode, title, brand, category, MRP, selling price, stock, image URL, and specifications).
4. Newly added products instantly reflect in the catalog and inventory dashboard.

---

## 🧪 Running Automated Backend Tests

The backend includes test coverage validating stock rules, input validation, authentication, and error handling:

```bash
cd backend
.\venv\Scripts\python -m pytest -v
```

**Test Scenarios Covered**:
- `test_health`: API status verification.
- `test_login_invalid_credentials`: 401 Unauthorized check.
- `test_create_product_unauthorized`: 401/403 protection on admin routes.
- `test_create_product_success_and_stock_rules`: Validates stock status classification:
  - `stock = 5` -> "In Stock", `can_add_to_cart = True`
  - `stock = 2` -> "Only Few Left", `can_add_to_cart = True`
  - `stock = 0` -> "Out of Stock", `can_add_to_cart = False`
- `test_data_validation_selling_price_greater_than_mrp`: Rejects invalid pricing with 422.
- `test_data_validation_negative_stock`: Rejects negative inventory counts with 422.
- `test_duplicate_sku_rejection`: Rejects duplicate SKUs with 400.
- `test_pagination_and_filtering`: Tests search, brand/category filters, and sorting.
- `test_admin_patch_stock_and_delete`: Tests stock count updates and item deletion.

---

## 📋 Assessment Questions & Interview Discussion

### 1. Important Assumptions Made
- **Stock Availability**: Stock rules apply at the moment the product is added or adjusted in the cart. If a product has stock = 0, the "Add to Cart" button is strictly disabled and marked "Out of Stock".
- **Cart Storage**: Cart persistence is managed via `localStorage` on the client side for seamless browsing across sessions.
- **Currency Format**: Formatted in Indian Rupees (INR - ₹) with appropriate comma separators.
- **Admin Management**: Products are managed through an authenticated Admin Panel rather than hardcoding.

### 2. Known Limitations
- Real-world distributed locking: In a high-concurrency production store, pessimistic database row-locking (`SELECT FOR UPDATE`) or Redis distributed locks would be used during checkout to prevent two users from buying the last remaining unit simultaneously.
- Image storage: Currently accepts public image URLs (e.g. Unsplash or CDN links) rather than direct S3 / Cloudinary multipart file uploads.

### 3. AI Tools Used
- Google Antigravity AI pair programmer for scaffolding, test generation, and architecture alignment.

### 4. What would you improve for Production?
- **Caching Layer**: Integrate **Redis** for caching frequently queried product catalog queries and filter metadata (`GET /api/products`).
- **Full-Text Search Engine**: Upgrade from SQL `LIKE / ILIKE` to PostgreSQL `tsvector` / GIN indexing or Elasticsearch / Meilisearch for fuzzy search, typo tolerance, and auto-complete.
- **Distributed Inventory Reservation**: Implement an inventory reservation system with a 10-minute hold window during checkout.
- **Payment Gateway Integration**: Integrate Razorpay or Stripe webhooks with idempotent transaction handling.
- **Image Pipeline**: Automated image optimization and compression using AWS S3 and Next.js `<Image />` component with CDN caching.
