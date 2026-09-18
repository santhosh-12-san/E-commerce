"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchProducts,
  fetchFilterMetadata,
  Product,
  FilterMetadata,
} from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";
import { Search, SlidersHorizontal, Loader2, Sparkles, X, ShoppingBag } from "lucide-react";

function ProductCatalogContent() {
  const searchParams = useSearchParams();

  // URL State & Query Params
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brand") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "created_desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 8;

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMeta, setFilterMeta] = useState<FilterMetadata>({
    brands: [],
    categories: [],
    total_products: 0,
    min_price: 0,
    max_price: 0,
  });

  // UI State: Drawer is hidden by default ("hide the filter and price range when we need that only show")
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync search input if query param changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Load Filter Metadata once on mount
  useEffect(() => {
    fetchFilterMetadata()
      .then((data) => setFilterMeta(data))
      .catch((err) => console.error("Error loading filter metadata:", err));
  }, []);

  // Fetch Products based on current filters and page
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        search: search.trim() || undefined,
        brand: selectedBrand || undefined,
        category: selectedCategory || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sort_by: sortBy,
        page,
        page_size: pageSize,
      });
      setProducts(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedBrand, selectedCategory, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleBrandChange = (b: string) => {
    setSelectedBrand(b);
    setPage(1);
  };

  const handleMinPriceChange = (val: string) => {
    setMinPrice(val);
    setPage(1);
  };

  const handleMaxPriceChange = (val: string) => {
    setMaxPrice(val);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("created_desc");
    setPage(1);
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== "created_desc" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Promo Hero Banner matching ShopNest Figma (Light Mint Green Theme) */}
      <div className="bg-gradient-to-r from-[#eaf6ed] via-[#f0fbf3] to-[#e4f5e9] rounded-3xl p-6 sm:p-10 border border-emerald-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10 text-center md:text-left max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-bold tracking-wide uppercase border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Top Brands • Best Prices</span>
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-emerald-950 leading-tight">
            Upgrade Your Lifestyle
          </h1>

          <p className="text-emerald-800/80 text-xs sm:text-sm font-medium">
            Discover curated top-tier tech, crystal audio, and modern essentials with verified stock and fast nationwide delivery.
          </p>

          <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("catalog-grid");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-emerald-200"
            >
              Shop Now
            </button>
            <span className="text-xs font-bold text-emerald-800">Up to 40% OFF Deals</span>
          </div>
        </div>

        {/* Gadgets Product Collage on Right (from Figma) */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Headphones */}
          <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white/90 p-2 shadow-sm border border-emerald-100/80 flex flex-col items-center justify-center hover:scale-105 transition-transform">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=240&auto=format&fit=crop&q=80"
              alt="Headphones"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1">Audio</span>
          </div>

          {/* Smartwatch */}
          <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white/90 p-2 shadow-sm border border-emerald-100/80 flex flex-col items-center justify-center hover:scale-105 transition-transform">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop&q=80"
              alt="Smartwatch"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1">Wearables</span>
          </div>

          {/* Smartphone */}
          <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl bg-white/90 p-2 shadow-sm border border-emerald-100/80 flex flex-col items-center justify-center hover:scale-105 transition-transform">
            <img
              src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=240&auto=format&fit=crop&q=80"
              alt="Phone"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1">Gadgets</span>
          </div>
        </div>
      </div>

      {/* On-Demand Slide-over Filter Drawer (Hidden until requested) */}
      <FilterSidebar
        categories={filterMeta.categories}
        brands={filterMeta.brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sortBy={sortBy}
        onCategoryChange={handleCategoryChange}
        onBrandChange={handleBrandChange}
        onMinPriceChange={handleMinPriceChange}
        onMaxPriceChange={handleMaxPriceChange}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />

      {/* Controls Bar: Search, On-Demand Filters Button & Sorting */}
      <div id="catalog-grid" className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title, brand, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </form>

          {/* Action buttons: Filter Drawer Toggle & Quick Sort */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* On-Demand Filters & Price Range Toggle Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition shadow-sm ${
                activeFiltersCount > 0
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-emerald-200"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters &amp; Price Range</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-emerald-800 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="created_desc">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium pl-2 hidden md:block">
              <span className="font-bold text-slate-900">{totalItems}</span> products
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Tags */}
        {(selectedCategory || selectedBrand || minPrice || maxPrice || search) && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                Category: {selectedCategory}
                <button onClick={() => handleCategoryChange("")} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                Brand: {selectedBrand}
                <button onClick={() => handleBrandChange("")} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                Price: ₹{minPrice || "0"} - {maxPrice ? `₹${maxPrice}` : "Max"}
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="hover:text-emerald-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                &quot;{search}&quot;
                <button onClick={() => setSearch("")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadProducts}
            className="text-xs font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Full-Width Product Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="min-h-[360px] flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium">Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <SlidersHorizontal className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {search || selectedBrand || selectedCategory || minPrice || maxPrice
                ? "No matching products found"
                : "No products available in the catalog"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {search || selectedBrand || selectedCategory || minPrice || maxPrice
                ? "Try adjusting your search query, price range, or removing active filters."
                : "No items have been added to the store yet. Products can be added via the store management system."}
            </p>
          </div>
          {(search || selectedBrand || selectedCategory || minPrice || maxPrice) && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 4-Column Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Server-Side Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-sm font-medium">Loading ShopNest...</span>
        </div>
      }
    >
      <ProductCatalogContent />
    </Suspense>
  );
}
