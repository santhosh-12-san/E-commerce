"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { StockBadge } from "@/components/StockBadge";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Save items you love by clicking the heart icon on any product card!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-200"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span>My Wishlist</span>
            <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Products saved to your personal wishlist
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const numericStock = typeof product.stock === "number" ? product.stock : parseInt(String(product.stock), 10) || 0;
          const isOutOfStock = numericStock <= 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full shadow transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {product.brand}
                    </span>
                    <StockBadge stock={product.stock} />
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="block font-bold text-slate-900 text-sm hover:text-emerald-800 transition line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">
                      ₹{product.selling_price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.selling_price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product, 1)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isOutOfStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-emerald-800 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? "Out of Stock" : "Move to Cart"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
