# MiniStore - Complete Figma Design System & UI Architecture

This document specifies the complete **Figma UI/UX Design System** for all pages of the MiniStore application. It provides design tokens, layout grids, wireframe components, and interview talking points.

---

## 🎨 Global Design Tokens

### 1. Color Palette

| Token Name | Hex Code | Tailwind Equivalent | Usage |
|---|---|---|---|
| **Primary Brand** | `#4F46E5` | `indigo-600` | Primary buttons, active nav states, brand logo |
| **Primary Hover** | `#4338CA` | `indigo-700` | Button hover states |
| **Primary Tint** | `#EEF2FF` | `indigo-50` | Filter chips, brand tags, active tab backgrounds |
| **Dark Neutral (Text)** | `#0F172A` | `slate-900` | Primary headings, product titles, bold prices |
| **Body Neutral** | `#475569` | `slate-600` | Secondary descriptions, specifications labels |
| **Muted Neutral** | `#94A3B8` | `slate-400` | Strikethrough MRP, breadcrumb separators, icons |
| **Surface Background** | `#F8FAFC` | `slate-50` | Page body background, thumbnail containers |
| **Card White** | `#FFFFFF` | `white` | Product cards, summary containers, modaled sheets |
| **Border Stroke** | `#E2E8F0` | `slate-200` | 1px hairline card borders, input field outlines |

#### Stock Status Badges & Alerts
- 🟢 **In Stock (`Stock >= 3`)**: Text `#047857` (`emerald-700`), Bg `#ECFDF5` (`emerald-50`), Border `#A7F3D0` (`emerald-200`).
- 🟠 **Only Few Left (`Stock = 1, 2`)**: Text `#92400E` (`amber-800`), Bg `#FFFBEB` (`amber-50`), Border `#FDE68A` (`amber-300`).
- 🔴 **Out of Stock (`Stock = 0`)**: Text `#B91C1C` (`red-700`), Bg `#FEF2F2` (`red-50`), Border `#FECACA` (`red-200`).

---

### 2. Typography Hierarchy (Inter / System Font)

- **Display H1**: `font-black`, `text-3xl` (30px) / `text-4xl` (36px), Line Height 1.15
- **Section H2**: `font-black`, `text-2xl` (24px), Line Height 1.25
- **Card Title H3**: `font-semibold`, `text-sm` (14px), 2-line clamp (`line-clamp-2`)
- **Price Tag (Selling)**: `font-extrabold` / `font-black`, `text-lg` (18px) to `text-3xl` (30px)
- **MRP Strikethrough**: `font-normal`, `text-xs` (12px), `line-through`
- **Body & Specs**: `font-normal` / `font-medium`, `text-xs` (12px) to `text-sm` (14px)
- **Micro Tags (SKU/Badge)**: `font-bold`, `text-[10px]` to `text-[11px]`, uppercase tracking

---

## 📱 Page-by-Page Figma Specifications

### Page 1: Product Listing (Catalog & On-Demand Drawer)
- **Header Navigation**:
  - Store Logo (`MiniStore`), Search Bar with live keyword filtering, Shopping Cart icon with bouncy item count badge.
- **Top Hero**:
  - Dark gradient banner (`slate-900` to `indigo-950`) highlighting curated inventory and live stock indicators.
- **Controls & Filters Bar**:
  - Search input with magnify icon.
  - **"Filters & Price Range"** button: Opens slide-over drawer on click, with dynamic active filter badge counter.
  - **Quick Sort** dropdown: Newest, Price (Low to High), Price (High to Low), Name (A-Z).
  - **Active Filter Chips**: Interactive pill tags showing active criteria (e.g. `Category: Electronics ✕`) with 1-click removal.
- **Product Card Grid**:
  - Clean 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
  - Aspect-ratio 1:1 image frame with zoom-on-hover transition.
  - Calculated discount percentage badge (`20% OFF`).
  - Stock badge (In Stock / Only Few Left / Out of Stock).
  - Add to Cart button (disabled automatically if Out of Stock).
- **Pagination Component**:
  - Item counter (`Showing 1-8 of 24 products`), Previous / Next chevron buttons, active page highlight.

---

### Page 2: Product Detail Page (PDP)
- **Breadcrumb Navigator**: `Home / Category / Product Name`
- **Two-Column Split Layout**:
  - **Left Column**: High-resolution image preview with discount badge, plus trust badges below (Fast Delivery, 7-Day Returns, 100% Genuine).
  - **Right Column**:
    - Brand pill badge + Stock status badge.
    - Product title in bold H1 typography.
    - Identification codes (SKU, Barcode, Subcategory).
    - Pricing box: Bold selling price, struck-through MRP, green savings callout.
    - **Quantity Selector**: `- 1 +` stepper strictly bounded by available stock ($1 \le \text{qty} \le \text{stock}$).
    - **Add to Cart Action**: Primary Indigo CTA button with real-time stock feedback.
    - **Product Specifications**: Clean two-column table displaying key-value attributes (Warranty, Color, Material, Connectivity).

---

### Page 3: Shopping Cart & Order Summary
- **Two-Column Responsive Layout**:
  - **Left (Cart Itemized List)**:
    - Thumbnail, Brand, Title, Unit Price, MRP strikethrough.
    - Quantity stepper with instant feedback.
    - Max stock warning alert if incrementing beyond available units.
    - Item total and Trash icon to remove item.
    - Empty cart state with "Explore Products" CTA button.
  - **Right (Sticky Order Summary Card)**:
    - Item count indicator.
    - Subtotal (calculated at MRP).
    - Total discount savings in emerald green (`- ₹X,XXX`).
    - Shipping: `FREE`.
    - **Final Payable Amount**: Highlighted in bold 24px font.
    - Promo Code input with one-click verification (`WELCOME500`).
    - Primary CTA: **"Proceed to Checkout"** triggering interactive success modal.

---

### Page 4: Admin Management Dashboard (`/admin`)
- **Metric Cards (Row 1)**:
  - Total Products (`Package` icon).
  - In Stock count (`CheckCircle2` icon in green).
  - Low Stock count (`AlertTriangle` icon in amber).
  - Out of Stock count (`XCircle` icon in red).
- **Header Actions**:
  - "+ Add New Product" button leading to `/admin/new`.
  - Search filter within catalog table.
- **Inventory Data Table**:
  - Columns: Image, SKU / Barcode, Name & Brand, Category, MRP, Selling Price, **Stock Adjuster (`-` Count `+`)**, Status Badge, Edit & Delete actions.
  - Allows the store manager to adjust inventory counts with one click.

---

### Page 5: Add / Edit Product Form (`/admin/new`)
- Clean form container with client-side & backend validation:
  - SKU (Unique text field).
  - Barcode (Optional text field).
  - Product Title (Required).
  - Brand & Category selectors.
  - Pricing container: MRP input & Selling Price input (live warning if $\text{Selling Price} > \text{MRP}$).
  - Stock Units input (live warning if $\text{Stock} < 0$, with real-time rule indicator: *Displays "Out of Stock" / "Only Few Left" / "In Stock"*).
  - Image URL with live preview thumbnail.
  - Dynamic **Specifications Builder**: Allows adding dynamic key-value rows on the fly (e.g. `Battery: 40 hrs`).
  - Submit button with loading state.

---

## 🗣️ Technical Interview Design Discussion Guide

> **Interviewer Question:** *"Can you explain your design thinking and how your Figma system connects to the frontend code?"*

**Key Points to Share:**
1. **Design Tokens to Tailwind Utility Mapping**:  
   *"Every color token in the Figma design maps 1:1 to Tailwind CSS classes (`slate-900` for high contrast text, `indigo-600` for primary actions, `emerald-500` for stock validation). This ensures complete consistency without duplicate CSS rules."*
2. **On-Demand Progressive Disclosure**:  
   *"Rather than cluttering the desktop screen with a permanent filter sidebar, I designed the filters and price range as an on-demand slide-over drawer. This gives 100% of the screen width to the product grid, prioritizing visual discovery while keeping price and category refinements just one click away."*
3. **Stock Transparency & Micro-Feedback**:  
   *"Ecommerce friction often happens when items go out of stock during checkout. In my design, stock rules are communicated early at every touchpoint: color-coded card badges on the listing page, capped quantity steppers on the PDP, and real-time inventory limit warnings in the shopping cart."*
