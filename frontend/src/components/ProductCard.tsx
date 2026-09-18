"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/api";
import { StockBadge } from "./StockBadge";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, Check, AlertCircle, Heart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numericStock = typeof product.stock === "number" ? product.stock : parseInt(String(product.stock), 10) || 0;
  const existingCartItem = cart.find((item) => item.product.id === product.id);
  const currentInCart = existingCartItem ? existingCartItem.quantity : 0;
  const isOutOfStock = numericStock <= 0;
  const isMaxReached = numericStock > 0 && currentInCart >= numericStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setErrorMsg(null);

    const result = addToCart(product, 1);
    if (result.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } else if (result.message) {
      setErrorMsg(result.message);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const formattedMRP = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.mrp);

  const formattedSellingPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.selling_price);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Left: Discount Pill Badge */}
      {product.discount_percentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full shadow-sm">
          {product.discount_percentage}% OFF
        </div>
      )}

      {/* Top Right: Wishlist Heart */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-sm ${
          isWishlisted
            ? "bg-rose-50 text-rose-600 shadow-rose-100"
            : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
        }`}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isWishlisted ? "fill-rose-600" : ""
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-square bg-slate-50 overflow-hidden"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 text-xs">
            No Image
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              {product.brand}
            </span>
            <StockBadge stock={product.stock} stockStatus={product.stock_status} size="sm" />
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`} className="block group-hover:text-emerald-800 transition">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500 text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-bold text-slate-800 text-xs">
                {product.rating ? product.rating.toFixed(1) : "4.5"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              ({product.rating_count || 128})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base sm:text-lg font-extrabold text-slate-900">
              {formattedSellingPrice}
            </span>
            {product.mrp > product.selling_price && (
              <span className="text-xs text-slate-400 line-through font-normal">
                {formattedMRP}
              </span>
            )}
          </div>

          {/* Stock Notification if Max in Cart */}
          {errorMsg && (
            <div className="mb-2 text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Emerald Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxReached}
            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : isMaxReached
                ? "bg-amber-50 text-amber-800 cursor-not-allowed border border-amber-300"
                : justAdded
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-emerald-200"
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isMaxReached ? (
              <span>Max in Cart ({product.stock})</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
