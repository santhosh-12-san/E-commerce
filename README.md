# ShopNest - Mini Ecommerce Full-Stack Application

A responsive, high-performance Mini Ecommerce web application built using **FastAPI (Python)**, **Direct Native PostgreSQL** (native SQL with psycopg2 and zero SQLAlchemy ORM), **Next.js (React / TypeScript / Tailwind CSS)**, and **JWT Authentication**.

This application was engineered according to the Website Developer Technical Assessment specifications, incorporating server-side pagination, database indexing, strict data validation, ecommerce inventory rules, an authenticated Admin Portal, and a `seeds.py` data populator with 50 realistic products.

---

##  Key Features

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

##  Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript | Server & Client Components, Responsive App Router |
| **Styling** | Tailwind CSS, Lucide React Icons | Modern, clean, responsive UI system |
| **Backend** | Python 3.11, FastAPI, Pydantic v2 | High-performance RESTful API & validation schemas |
| **Database** | Direct Native PostgreSQL / psycopg2 (Zero SQLAlchemy) | Relational database with B-Tree indexes & SQLite fallback |
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


---

### 1. How to Install the Project

#### Prerequisites
- **Python**: 3.10 or 3.11 installed
- **Node.js**: 18.0.0+ and `npm` installed
- **PostgreSQL** *(Optional)*: If installed locally, the backend connects using credentials in `backend/.env`. If PostgreSQL is not installed or running, the backend automatically uses a local SQLite fallback (`backend/ecommerce.db`) so the project runs with zero setup.

#### Installation Steps
1. **Clone or download the project repository**:
   ```bash
   git clone <repository-url>
   cd mini-ecommerce
   ```

2. **Set up the Backend environment**:
   ```bash
   cd backend
   python -m venv venv

   # Activate virtual environment
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Windows (CMD):
   .\venv\Scripts\activate.bat
   # On macOS / Linux:
   source venv/bin/activate

   # Install required Python packages
   pip install -r requirements.txt
   ```

3. **Set up the Frontend environment**:
   Open a separate terminal window at the project root:
   ```bash
   cd frontend
   npm install
   ```

---

### 2. How to Run the Frontend

In your frontend terminal:
```bash
cd frontend
npm run dev
```

The Next.js development server will start at:
- **Storefront Website**: [http://localhost:3000](http://localhost:3000)
- **Admin Inventory Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

The frontend automatically communicates with the backend API at `http://127.0.0.1:8000/api`.

---

### 3. How to Run the Backend

In your backend terminal (with the virtual environment activated):
```bash
cd backend
python run.py
```

The FastAPI application will start at:
- **API Base URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

*(Optional) Running with Docker Compose*:
If you prefer running everything inside Docker containers:
```bash
docker compose up --build
```

---

### 4. How to Set Up the Database

#### Direct Native SQL (Zero SQLAlchemy ORM)
This project uses **Direct Native PostgreSQL** with parameterized raw SQL via `psycopg2` (and sqlite3 for fallback). There is **no SQLAlchemy ORM**, ensuring clean query control, fast connection handling, and zero ORM overhead.

#### Automatic Table Creation
When you launch the backend (`python run.py`), `database.py` automatically initializes the schema if tables do not exist:
- `products`: Catalog items, pricing, inventory stock, brand, category, specifications JSON.
- `users`: Administrator accounts with bcrypt-hashed passwords.
- `orders`: Customer checkout details and order totals.
- `order_items`: Order line items with price snapshots.
- B-Tree indexes on `sku`, `brand`, `category`, and `selling_price`.

#### Optional: PostgreSQL Connection
To use an existing PostgreSQL instance, configure `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password
```
If no PostgreSQL server is running, the backend automatically uses `backend/ecommerce.db` with zero extra configuration.

#### Populating 50 Realistic Products (`seeds.py`)
To populate the database with **50 realistic products** across 8 categories (Electronics, Audio, Wearables, Cameras, Footwear, Fashion, Home & Kitchen, Personal Care):

```bash
# Run from project root:
python seeds.py

# Or from backend directory:
cd backend
python seeds.py
```

**Stock Rule Distribution in the 50 Seeded Products**:
- **5 Out of Stock (`stock = 0`)**: Displays red `Out of Stock` badge; "Add to Cart" button is automatically disabled.
- **11 Low Stock (`stock = 1 or 2`)**: Displays amber `Only Few Left` badge; quantity selector is capped to available units.
- **34 In Stock (`stock >= 3`)**: Displays emerald `In Stock` badge; standard purchasing enabled.
- **Admin Account**: Default admin created (`admin` / `admin123`).

---

### 5. Important Assumptions Made

1. **Live Inventory Gating**: Stock rules must be enforced both on the client and server. A product with `stock = 0` can never be added to the cart, and order submission immediately validates and decrements available inventory in a single atomic database operation.
2. **Client-Side Cart Persistence**: The shopping cart is preserved in browser `localStorage`. This allows shoppers to refresh, navigate across product pages, or return later without losing their selected items.
3. **Currency & Locale**: All pricing is presented in Indian Rupees (`₹` / INR) with standard comma separators (`₹1,49,900`). Delivery pincode verification supports standard 6-digit Indian postal codes.
4. **Separation of Admin and Shopper**: Shoppers can browse, filter, search, manage a wishlist, and place orders without requiring prior account registration. Administrative functions (stock editing, product creation, CSV bulk import) are strictly protected by JWT authentication.
5. **Data Integrity**: Selling price must never exceed MRP (`selling_price <= mrp`), stock cannot be negative (`stock >= 0`), and product SKUs must remain strictly unique across the catalog.

---

### 6. Known Limitations

1. **High-Concurrency Race Conditions**: In a massive production flash-sale scenario with thousands of simultaneous checkouts for a single remaining unit, database-level pessimistic row locking (`SELECT FOR UPDATE`) or a distributed Redis lock would be required to prevent overselling.
2. **External Image Hosting**: Product images currently point to high-resolution HTTPS URLs (Unsplash CDN) rather than handling direct multipart uploads to AWS S3 or Cloudinary.
3. **Simulated Payment Gateway**: The checkout flow creates real orders in the database, generates unique order tracking numbers, and reduces inventory, but uses simulated payment options (Cash on Delivery or Mock UPI/Card) rather than a live banking merchant gateway.
4. **Text Search Typo-Tolerance**: Product searching uses case-insensitive SQL matching (`LIKE / ILIKE`). While fast and indexed, it does not support phonetic matching or typo tolerance (e.g., searching "hedphones" for "headphones").

---

### 7. Any AI Tools Used

 ## chatgpt,
 ## google gemini
---

### 8. What You Would Improve If Developed for Production

If scaling this system into an enterprise production environment, the following enhancements would be added:

1. **Redis Caching Layer**: Add Redis to cache frequently read product listings, category filters, and session tokens, drastically reducing primary database read traffic.
2. **Full-Text Search Engine**: Implement PostgreSQL `tsvector` with GIN indexing or integrate Meilisearch/Elasticsearch for instant fuzzy search, spelling auto-correction, and faceted navigation.
3. **Inventory Reservation Window**: Implement a 10-minute temporary inventory reservation when a user enters the checkout flow, preventing inventory race conditions and automatically releasing units if the checkout is abandoned.
4. **Real Payment Gateway Integration**: Connect Razorpay or Stripe with webhook listeners, idempotent order verification, and automated refund management.
5. **Cloud Object Storage & Image Pipeline**: Integrate AWS S3 with presigned upload URLs and automated WebP image optimization via Cloudflare or AWS Lambda.
6. **Asynchronous Task Queue**: Use Celery / RabbitMQ for offloading background tasks such as sending order confirmation emails, generating PDF tax invoices, and updating external analytics.
7. **CI/CD & Observability**: Set up automated GitHub Actions for linting and testing, containerized Kubernetes/ECS deployment, and Prometheus/Grafana or Sentry for error tracking and APM monitoring.

---

##  Implemented Features

All 13 bonus features from the assessment brief have been implemented:

| Feature | Description | File / Route |
## 
| **1. Pincode Delivery Availability** | Delivery checker with estimated arrival dates for Indian pincodes | `frontend/src/app/products/[id]/page.tsx` |
| **2. Wishlist** | Persistent wishlist with heart toggle, counter badge, and dedicated page | `frontend/src/app/wishlist/page.tsx` |
| **3. Recently Viewed Products** | Carousel showing the user's last 6 viewed items stored in `localStorage` | `frontend/src/app/products/[id]/page.tsx` |
| **4. Coupon Functionality** | Apply code `WELCOME500` for ₹500 discount on carts over ₹2,000 | `frontend/src/context/CartContext.tsx` |
| **5. Customer & Admin Auth** | JWT bearer token authentication with bcrypt password hashing | `backend/routes/auth.py` |
| **6. Simple Admin Panel** | Live inventory metrics, stock adjustment steppers, product deletion | `frontend/src/app/admin/page.tsx` |
| **7. Product CSV/Excel Import** | Bulk CSV import modal on the admin page for catalog batch upload | `backend/routes/admin.py` |
| **8. Automated Tests** | 11 pytest integration tests validating inventory rules and routes | `backend/tests/test_api.py` |
| **9. Docker Setup** | Multi-container orchestration (PostgreSQL, Backend, Frontend) | `docker-compose.yml` |
| **10. Cloud Deployment Guide** | Complete deployment documentation for Render, Vercel, Supabase | `DEPLOYMENT.md` |
| **11. Product Recommendations** | Related items carousel by category and brand matching | `GET /api/products/{id}/similar` |
| **12. Real Order Creation** | Order submission with customer address, stock deduction, and order ID | `POST /api/orders` |
| **13. 3-Step Checkout Flow** | Clean step-by-step guest checkout: Shipping -> Payment -> Confirmation | `frontend/src/app/checkout/page.tsx` |

---

## Automated Testing

To run the backend integration test suite:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

**11 passing test scenarios**:
- `test_health`: API status and database connectivity
- `test_login_invalid_credentials`: 401 Unauthorized check
- `test_create_product_unauthorized`: 401/403 protection on admin endpoints
- `test_create_product_success_and_stock_rules`: Stock status classification (`In Stock`, `Only Few Left`, `Out of Stock`)
- `test_data_validation_selling_price_greater_than_mrp`: Rejects invalid pricing with 422
- `test_data_validation_negative_stock`: Rejects negative inventory with 422
- `test_duplicate_sku_rejection`: Rejects duplicate SKUs with 400
- `test_pagination_and_filtering`: Search, brand/category filters, and sorting
- `test_similar_and_recommended_products`: Recommendation endpoint verification
- `test_admin_patch_stock_and_delete`: Inventory stock updates and product removal
- `test_check_inventory`: Inventory check endpoint

---

##  Default Credentials & Quick Test Data

- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username**: `admin`
- **Password**: `admin123`
- **Demo Coupon Code**: `WELCOME500` (gives ₹500 off on carts over ₹2,000)
- **Sample Delivery Pincodes**: `110001` (Delhi), `400001` (Mumbai), `560001` (Bangalore), `600001` (Chennai)
