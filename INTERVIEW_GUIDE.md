# Technical Discussion & Interview Guide

This guide prepares you for the technical assessment interview. It covers concise, impressive explanations for all questions highlighted on **Pages 8 and 9 of the assessment document**.

---

## 1. How Your Application Works (High-Level Overview)

> **Interviewer Question:** *"Can you walk us through the high-level architecture of your project?"*

**Answer:**
- The project follows a modern decoupled full-stack architecture:
  - **Backend (FastAPI)**: Serves RESTful API endpoints, connects directly to the relational database using a **Pure Native SQL Engine** (with `psycopg2` / parameterized queries, zero SQLAlchemy ORM), and handles strict data validation using Pydantic v2 schemas. It secures sensitive routes (product creation, editing, and stock adjustments) with JWT Bearer tokens.
  - **Frontend (Next.js 14 App Router)**: Provides a responsive user interface styled with Tailwind CSS according to Figma design tokens. It communicates with the backend via asynchronous `fetch` calls, manages global cart and auth state using React Context, and enforces stock constraints on client interactions.
  - **Database (PostgreSQL / SQLite fallback)**: Uses indexed tables (`products`, `users`) with DDL-created B-Tree indexes, ensuring sub-millisecond lookups for search, category filtering, and price sorting.
- Products can be seeded using `seeds.py` (50 realistic products) or added/managed manually through the **Admin Portal** (`/admin/new`) using JWT authentication, keeping the store dynamic without hardcoding.

---

## 2. How the Frontend Communicates with the Backend

> **Interviewer Question:** *"How does the frontend communicate with the backend? How are errors handled?"*

**Answer:**
- **API Client Layer (`src/lib/api.ts`)**: All HTTP requests are centralized into typed functions.
- **Headers & JWT Tokens**: When accessing admin endpoints, the API client automatically extracts the JWT token from `localStorage` and attaches it as `Authorization: Bearer <token>`.
- **Query Parameters for Optimizations**:
  - The Product Listing page transmits URL query parameters: `?search=...&brand=...&category=...&sort_by=...&page=...&page_size=...`.
  - The backend receives these, applies SQL filters with database indexes, and returns a paginated JSON response containing `items`, `total`, `page`, and `total_pages`.
- **Error Handling**: Responses are checked with `res.ok`. If an error occurs (such as 422 validation error or 401 unauthorized), the JSON error detail is parsed and surfaced to the UI via responsive alert components rather than crashing the application.

---

## 3. How Products are Stored & Database Indexing

> **Interviewer Question:** *"How are products stored, and how did you optimize database queries?"*

**Answer:**
- **Entity Schema (`backend/app/db.py`)**:
  - `id`: Primary Key (SERIAL / AUTOINCREMENT).
  - `sku`: VARCHAR(100) / TEXT (Unique, Indexed).
  - `barcode`: VARCHAR(100) / TEXT.
  - `name`: VARCHAR(255) / TEXT (Indexed).
  - `brand`: VARCHAR(100) / TEXT (Indexed).
  - `category`: VARCHAR(100) / TEXT (Indexed).
  - `subcategory`: VARCHAR(100) / TEXT.
  - `mrp`: DOUBLE PRECISION / REAL.
  - `selling_price`: DOUBLE PRECISION / REAL (Indexed).
  - `stock`: INTEGER.
  - `specifications`: TEXT storing structured JSON.
  - `rating`: DOUBLE PRECISION / REAL.
  - `rating_count`: INTEGER.
- **Pure Native SQL & Indexing Strategy**:
  - Zero SQLAlchemy ORM: all queries run through raw native parameterized SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) with connection pooling and placeholder translation (`%s` for PostgreSQL, `?` for SQLite).
  - Single-column B-Tree indexes on `brand`, `category`, and `selling_price` allow `WHERE` and `ORDER BY` clauses to run in $O(\log N)$ time rather than sequential table scans $O(N)$.
  - Composite Index `ix_product_category_price` on `(category, selling_price)` optimizes combined category filtering and price sorting.
  - Server-side pagination (`LIMIT` and `OFFSET`) prevents loading thousands of rows into memory, ensuring scalable database performance.

---

## 4. How Inventory and Stock Rules are Handled

> **Interviewer Question:** *"How are stock rules implemented across the stack?"*

**Answer:**
We implemented the three specific stock states both in the backend business logic and frontend UI:
1. **`Stock = 0` ("Out of Stock")**:
   - Backend: Sets `stock_status = "Out of Stock"` and `can_add_to_cart = False`.
   - Frontend: Displays a red "Out of Stock" badge. The "Add to Cart" button is disabled.
2. **`Stock in [1, 2]` ("Only Few Left")**:
   - Backend: Sets `stock_status = "Only Few Left"` and `can_add_to_cart = True`.
   - Frontend: Displays an amber pulsing badge indicating urgency. The customer is allowed to purchase up to the remaining stock.
3. **`Stock >= 3` ("In Stock")**:
   - Backend: Sets `stock_status = "In Stock"` and `can_add_to_cart = True`.
   - Frontend: Displays an emerald badge.

---

## 5. How the Cart Logic Works

> **Interviewer Question:** *"How does your shopping cart calculate totals and enforce stock limitations?"*

**Answer:**
- **Cart Context (`src/context/CartContext.tsx`)**:
  - Tracks an array of `{ product, quantity }` objects and synchronizes with `localStorage`.
- **Inventory Limit Enforcement**:
  - The `addToCart` and `updateQuantity` functions check `currentQuantity + addedQuantity <= product.stock`. If a user attempts to increment past available stock, the action is blocked, and an alert informs the user: *"Cannot add more. Available stock limit is X"*.
- **Financial Calculations**:
  - **Subtotal (MRP)**: $\sum (\text{product.mrp} \times \text{quantity})$
  - **Final Payable Amount**: $\sum (\text{product.selling_price} \times \text{quantity})$
  - **Total Discount**: $\text{Subtotal (MRP)} - \text{Final Payable Amount}$

---

## 6. How You Handled Incorrect or Incomplete Data

> **Interviewer Question:** *"How does your system handle invalid data, such as selling price higher than MRP or duplicate SKUs?"*

**Answer:**
We implemented defense-in-depth across both frontend and backend:
1. **Selling Price > MRP**:
   - Pydantic `@model_validator` in `backend/app/schemas.py` checks `if selling_price > mrp`. If violated, it raises an HTTP 422 Unprocessable Entity error.
   - The frontend Admin Form provides live validation highlighting the input in red and preventing submission.
2. **Negative Inventory (`stock < 0`)**:
   - Pydantic Field constraint `Field(..., ge=0)` rejects any negative integer with a 422 error.
3. **Duplicate SKU**:
   - The database enforces a `unique=True` constraint on `sku`.
   - The admin creation endpoint checks for existing SKUs and returns a clear 400 Bad Request error: `"A product with SKU 'XYZ' already exists."`
4. **Missing Required Fields**:
   - Empty or whitespace strings are intercepted with Pydantic field validators.

---

## 7. Why You Selected Your Technology Stack

> **Interviewer Question:** *"Why did you choose FastAPI, PostgreSQL, and Next.js?"*

**Answer:**
- **FastAPI**:
  - Extremely fast (asynchronous ASGI on Starlette and Uvicorn).
  - Automatic OpenAPI / Swagger interactive documentation (`/docs`).
  - Native type safety and validation with Pydantic v2.
- **PostgreSQL**:
  - Industry gold-standard ACID-compliant relational database.
  - Rich indexing capabilities (B-Tree, GIN, composite indexes).
- **Next.js (React + Tailwind CSS)**:
  - App router provides fast server-rendering, code splitting, and dynamic routes.
  - Tailwind CSS enables rapid, responsive UI development without bloated CSS files.

---

## 8. What Would You Change for a Production Ecommerce Website?

> **Interviewer Question:** *"If you were taking this to production for 100,000 users, what would you add?"*

**Answer:**
1. **Distributed Caching (Redis)**: Cache product listing responses and filter metadata to reduce database load.
2. **Pessimistic Locking / Concurrency Control**: During checkout, acquire a row-level lock (`SELECT ... FOR UPDATE`) or a Redis distributed lock to prevent race conditions when two users buy the last available item at the exact same millisecond.
3. **Full-Text Search Engine**: Integrate PostgreSQL `tsvector` or Elasticsearch/Meilisearch for typo-tolerant fuzzy search.
4. **Cloud Asset Storage**: Upload product images to Amazon S3 / Cloudinary via presigned URLs and serve them via Cloudflare CDN.
5. **Payment Gateway & Webhooks**: Integrate Stripe or Razorpay with idempotent webhook event listeners.
6. **Background Task Workers**: Use Celery / Redis or AWS SQS for sending order confirmation emails and handling bulk CSV imports asynchronously.

---

## 9. Potential Live Code Modifications During the Interview

Here is how you can quickly make common adjustments if requested by the interviewer:

- **Change Stock Rule Thresholds**:
  - Edit `backend/app/schemas.py` in `compute_stock_status`:
    Change `stock in (1, 2)` to your desired threshold (e.g., `stock <= 5`).
- **Add a New Filter (e.g. Price Range slider)**:
  - Backend already supports `min_price` and `max_price` query parameters in `backend/app/routers/products.py`. Simply pass them from the frontend!
- **Add a New Field (e.g. Weight or Rating)**:
  - Add column in `backend/app/db.py`, update `schemas.py`, and render in `ProductCard.tsx`.
