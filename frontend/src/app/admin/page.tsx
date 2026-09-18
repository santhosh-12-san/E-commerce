"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProducts,
  adminDeleteProduct,
  adminUpdateStock,
  Product,
} from "@/lib/api";
import { StockBadge } from "@/components/StockBadge";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  MinusCircle,
  Upload,
  FileSpreadsheet,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // CSV Import modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; errors: string[] } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const loadAllProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        search: searchTerm.trim() || undefined,
        page_size: 100, // Load catalog for inventory table
        sort_by: "created_desc",
      });
      setProducts(data.items);
    } catch (err: any) {
      console.error("Failed to load products in admin:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllProducts();
    }
  }, [isAuthenticated, loadAllProducts]);

  const handleQuickStockChange = async (productId: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const updated = await adminUpdateStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update stock");
    }
  };

  const handleDelete = async (productId: number, sku: string) => {
    if (!confirm(`Are you sure you want to delete product SKU: ${sku}?`)) return;
    try {
      await adminDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setActionMessage(`Product ${sku} deleted successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("http://127.0.0.1:8000/api/admin/products/import-csv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("shopnest_admin_token")}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({
          imported: data.imported,
          updated: data.updated,
          errors: data.errors || [],
        });
        setActionMessage(`CSV processed: ${data.imported} added, ${data.updated} updated.`);
        loadAllProducts();
      } else {
        alert(data.detail || "Failed to import CSV");
      }
    } catch (err: any) {
      alert(err.message || "Network error during CSV upload");
    } finally {
      setIsImporting(false);
    }
  };

  if (authLoading || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  // Calculate Metrics
  const totalCount = products.length;
  const inStockCount = products.filter((p) => p.stock >= 3).length;
  const lowStockCount = products.filter((p) => p.stock === 1 || p.stock === 2).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-8">
      {/* Top Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ShopNest Inventory Management
          </h1>
         
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Import CSV</span>
          </button>
          <Link
            href="/admin/new"
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-200 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Items</span>
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 block">In Stock (&ge; 3)</span>
            <span className="text-2xl font-black text-emerald-700">{inStockCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block">Low Stock (1, 2)</span>
            <span className="text-2xl font-black text-amber-700">{lowStockCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 block">Out of Stock (0)</span>
            <span className="text-2xl font-black text-rose-700">{outOfStockCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Products Table with Quick Stock Control */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Table Search Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by SKU or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 text-slate-800"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{products.length}</strong> items in PostgreSQL database
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-700" />
            <span className="text-xs">Loading database records...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No products found in database</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You can manually add your first product using the Add New Product button above.
            </p>
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-4 py-3.5">SKU / Barcode</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">MRP</th>
                  <th className="px-4 py-3.5">Selling Price</th>
                  <th className="px-4 py-3.5">Live Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <Link
                          href={`/products/${p.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition block truncate"
                          title={p.name}
                        >
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-emerald-800 font-semibold uppercase">
                          {p.brand}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-[11px]">
                      <div className="font-semibold text-slate-900">{p.sku}</div>
                      {p.barcode && <div className="text-slate-400 text-[10px]">{p.barcode}</div>}
                    </td>

                    <td className="px-4 py-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                        {p.category}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-400 line-through">
                      ₹{p.mrp.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      ₹{p.selling_price.toLocaleString("en-IN")}
                    </td>

                    {/* Interactive Stock Stepper */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickStockChange(p.id, p.stock, -1)}
                          disabled={p.stock <= 0}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                          title="Decrease Stock"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-bold w-6 text-center text-slate-900">
                          {p.stock}
                        </span>
                        <button
                          onClick={() => handleQuickStockChange(p.id, p.stock, 1)}
                          className="text-slate-400 hover:text-emerald-700 transition"
                          title="Increase Stock"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StockBadge stock={p.stock} stockStatus={p.stock_status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/edit/${p.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.sku)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Import Products from CSV</h3>
                  <p className="text-xs text-slate-500">Bulk upload or update catalog items</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setImportResult(null);
                  setCsvFile(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
              <div className="font-bold text-slate-700 font-sans">Required CSV Headers:</div>
              <div className="text-[11px] text-slate-500 break-all">
                sku, name, brand, category, subcategory, mrp, selling_price, stock, image_url, barcode
              </div>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="csv-upload" className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {csvFile ? csvFile.name : "Click to select a CSV file"}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Supported format: .csv (UTF-8)
                  </span>
                </label>
              </div>

              {importResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-900">
                    Import Result: {importResult.imported} added, {importResult.updated} updated
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="text-rose-600 max-h-24 overflow-y-auto">
                      {importResult.errors.map((e, idx) => (
                        <div key={idx}>• {e}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!csvFile || isImporting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload &amp; Import</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
