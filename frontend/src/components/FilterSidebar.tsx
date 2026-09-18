"use client";

import React from "react";
import { Filter, X, ArrowDownUp, Tag, Layers, IndianRupee, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  categories: string[];
  brands: string[];
  selectedCategory: string;
  selectedBrand: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  minPrice,
  maxPrice,
  sortBy,
  onCategoryChange,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onReset,
  isOpen,
  onClose,
}) => {
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== "created_desc" ? 1 : 0);

  const pricePresets = [
    { label: "Under ₹1,000", min: "", max: "1000" },
    { label: "₹1,000 - ₹2,500", min: "1000", max: "2500" },
    { label: "₹2,500 - ₹5,000", min: "2500", max: "5000" },
    { label: "₹5,000+", min: "5000", max: "" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Filters &amp; Price Range
                </h2>
                <p className="text-[11px] text-slate-500">
                  {activeFiltersCount > 0
                    ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? "s" : ""}`
                    : "Refine catalog by price, brand, or category"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-slate-100">
            {/* Sort Order */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sort Order</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="created_desc">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
                <span>Price Range (₹)</span>
              </label>

              {/* Min & Max Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 mb-1 block">Min Price</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => onMinPriceChange(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 mb-1 block">Max Price</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="No limit"
                      value={maxPrice}
                      onChange={(e) => onMaxPriceChange(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Price Range Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pricePresets.map((preset) => {
                  const isSelected = minPrice === preset.min && maxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        onMinPriceChange(preset.min);
                        onMaxPriceChange(preset.max);
                      }}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Categories</span>
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onCategoryChange("")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    selectedCategory === ""
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "text-slate-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === "" && <span className="w-2 h-2 rounded-full bg-emerald-700" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      selectedCategory === cat
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Brands</span>
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onBrandChange("")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    selectedBrand === ""
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "text-slate-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span>All Brands</span>
                  {selectedBrand === "" && <span className="w-2 h-2 rounded-full bg-emerald-700" />}
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onBrandChange(b)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      selectedBrand === b
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <span className="w-2 h-2 rounded-full bg-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
