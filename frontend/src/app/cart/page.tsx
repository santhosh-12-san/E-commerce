"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemsCount,
    subtotalMRP,
    totalDiscount,
    finalPayableAmount,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotalMRP);

  const formattedDiscount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalDiscount + (couponApplied ? 500 : 0));

  const payableTotal = Math.max(0, finalPayableAmount - (couponApplied ? 500 : 0));
  const formattedPayable = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(payableTotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "WELCOME500") {
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code. Try 'WELCOME500' for demo discount!");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review your selected items and proceed to multi-step checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {cart.map(({ product, quantity }) => {
            const itemTotal = product.selling_price * quantity;
            const formattedItemTotal = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(itemTotal);

            const isAtMaxStock = quantity >= product.stock;

            return (
              <div
                key={product.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="block text-sm font-bold text-slate-900 hover:text-emerald-700 transition line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Unit Price: <strong>₹{product.selling_price}</strong></span>
                      {product.mrp > product.selling_price && (
                        <span className="line-through text-slate-400 text-[11px]">₹{product.mrp}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepper, Total & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4">
                  {/* Quantity Stepper */}
                  <div className="space-y-1 text-center">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white transition"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (!isAtMaxStock) {
                            updateQuantity(product.id, quantity + 1);
                          }
                        }}
                        disabled={isAtMaxStock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                        title={isAtMaxStock ? "Max available stock reached" : "Increase"}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {isAtMaxStock && (
                      <div className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5 justify-center">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Max stock ({product.stock})</span>
                      </div>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-sm font-bold text-slate-900">{formattedItemTotal}</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (MRP)</span>
                <span className="font-semibold text-slate-800">{formattedSubtotal}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Discount</span>
                <span>- {formattedDiscount}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="text-sm font-bold">Final Payable Amount</span>
                <span className="text-xl font-black text-slate-900">{formattedPayable}</span>
              </div>
            </div>

            {/* Promo code input */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Apply Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. WELCOME500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-700 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplied || !couponCode.trim()}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 disabled:opacity-40 transition"
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Coupon WELCOME500 applied! Saved ₹500 extra.
                </p>
              )}
            </form>

            {/* Checkout Action Button */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Safe &amp; Encrypted Checkout Experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
