const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Product {
  id: number;
  sku: string;
  barcode?: string | null;
  name: string;
  brand: string;
  category: string;
  subcategory?: string | null;
  mrp: number;
  selling_price: number;
  stock: number;
  image_url?: string | null;
  specifications?: string | null;
  specifications_dict?: Record<string, string> | null;
  discount_percentage: number;
  stock_status: "Out of Stock" | "Only Few Left" | "In Stock";
  can_add_to_cart: boolean;
  rating?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FilterMetadata {
  brands: string[];
  categories: string[];
  total_products: number;
  min_price: number;
  max_price: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  role: string;
}

// Helper to get stored JWT token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.removeItem("admin_token");
  }
}

export async function fetchProducts(params: {
  search?: string;
  brand?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedProductsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.min_price !== undefined) query.set("min_price", params.min_price.toString());
  if (params.max_price !== undefined) query.set("max_price", params.max_price.toString());
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.page) query.set("page", params.page.toString());
  if (params.page_size) query.set("page_size", params.page_size.toString());

  const res = await fetch(`${API_BASE_URL}/api/products?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

export async function fetchProductById(id: string | number): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Product not found");
  }
  return res.json();
}

export async function fetchSimilarProducts(id: string | number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/similar`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchRecommendedProducts(id: string | number): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}/recommendations`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchFilterMetadata(): Promise<FilterMetadata> {
  const res = await fetch(`${API_BASE_URL}/api/products/filters/meta`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch filter options");
  }
  return res.json();
}

export async function adminLogin(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Invalid username or password");
  }
  const data = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function adminGetProfile(): Promise<{ id: number; username: string; role: string }> {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Authentication session expired");
  }
  return res.json();
}

export async function adminCreateProduct(data: any): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create product" }));
    throw new Error(err.detail || "Failed to create product");
  }
  return res.json();
}

export async function adminUpdateProduct(id: number, data: any): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update product" }));
    throw new Error(err.detail || "Failed to update product");
  }
  return res.json();
}

export async function adminUpdateStock(id: number, stock: number): Promise<Product> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}/stock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stock }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update stock" }));
    throw new Error(err.detail || "Failed to update stock");
  }
  return res.json();
}

export async function adminDeleteProduct(id: number): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to delete product" }));
    throw new Error(err.detail || "Failed to delete product");
  }
}


