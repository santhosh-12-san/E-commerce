"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchProductById, adminUpdateProduct, Product } from "@/lib/api";
import {
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";

interface SpecItem {
  key: string;
  value: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [mrp, setMrp] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState<string>("4.5");
  const [ratingCount, setRatingCount] = useState<string>("120");
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductById(productId)
      .then((p: Product) => {
        setSku(p.sku);
        setBarcode(p.barcode || "");
        setName(p.name);
        setBrand(p.brand);
        setCategory(p.category);
        setSubcategory(p.subcategory || "");
        setMrp(p.mrp.toString());
        setSellingPrice(p.selling_price.toString());
        setStock(p.stock.toString());
        setImageUrl(p.image_url || "");
        setRating((p.rating || 4.5).toString());
        setRatingCount((p.rating_count || 120).toString());

        if (p.specifications_dict) {
          const arr: SpecItem[] = Object.entries(p.specifications_dict).map(([k, v]) => ({
            key: k,
            value: String(v),
          }));
          setSpecs(arr);
        } else {
          setSpecs([]);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load product");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  const numMrp = parseFloat(mrp) || 0;
  const numSelling = parseFloat(sellingPrice) || 0;
  const numStock = parseInt(stock, 10) || 0;
  const numRating = parseFloat(rating) || 4.5;
  const numRatingCount = parseInt(ratingCount, 10) || 120;
  const isPriceInvalid = numMrp > 0 && numSelling > numMrp;
  const isStockInvalid = numStock < 0;

  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numSelling > numMrp) {
      setError("Selling price cannot be greater than MRP.");
      return;
    }

    if (numStock < 0) {
      setError("Stock inventory cannot be negative.");
      return;
    }

    setSubmitting(true);

    try {
      const specsDict: Record<string, string> = {};
      specs.forEach((item) => {
        if (item.key.trim()) {
          specsDict[item.key.trim()] = item.value.trim();
        }
      });

      const payload = {
        sku: sku.trim(),
        barcode: barcode.trim() || null,
        name: name.trim(),
        brand: brand.trim(),
        category: category.trim(),
        subcategory: subcategory.trim() || null,
        mrp: numMrp,
        selling_price: numSelling,
        stock: numStock,
        rating: numRating,
        rating_count: numRatingCount,
        image_url: imageUrl.trim() || null,
        specifications: Object.keys(specsDict).length > 0 ? JSON.stringify(specsDict) : null,
      };

      await adminUpdateProduct(parseInt(productId, 10), payload);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Editing Product #{productId}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Edit Product #{productId}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Update pricing, inventory, and specifications stored in PostgreSQL
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Barcode / UPC / EAN
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          {/* Pricing & Stock Rules */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pricing &amp; Inventory Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none font-mono ${
                    isPriceInvalid
                      ? "border-rose-400 focus:border-rose-500 text-rose-700"
                      : "border-slate-200 focus:border-emerald-700"
                  }`}
                />
                {isPriceInvalid && (
                  <p className="text-[10px] text-rose-600 font-semibold mt-1">
                    Selling Price cannot exceed MRP!
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Stock Units</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none font-mono ${
                    isStockInvalid
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-emerald-700"
                  }`}
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Status:{" "}
                  {numStock <= 0 ? (
                    <strong className="text-rose-600">Out of Stock (stock = 0)</strong>
                  ) : numStock <= 2 ? (
                    <strong className="text-amber-600">Only Few Left (stock = 1, 2)</strong>
                  ) : (
                    <strong className="text-emerald-600">In Stock (stock &ge; 3)</strong>
                  )}
                </div>
              </div>
            </div>

            {/* Rating inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Rating (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-700 outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Review Count</label>
                <input
                  type="number"
                  min="0"
                  value={ratingCount}
                  onChange={(e) => setRatingCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-700 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Product Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
            />
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-[11px] text-slate-500">Live preview</span>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Specifications
              </label>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || isPriceInvalid || isStockInvalid}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-200 disabled:opacity-40 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Updating..." : "Update Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
