"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Heart, ShieldCheck, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md">
      {/* Top micro-bar */}
      <div className="bg-emerald-900/60 border-b border-emerald-700/40 text-[11px] py-1 px-4 sm:px-8 text-emerald-100 flex items-center justify-between">
        <span>Free shipping on all orders over ₹999 | 100% Genuine Products</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">24/7 Support: support@shopnest.com</span>
          {isAuthenticated && (
            <div className="flex items-center gap-2 pl-3 border-l border-emerald-700">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-emerald-200 hover:text-white font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Admin ({user?.username})</span>
              </Link>
              <button
                onClick={logout}
                className="text-emerald-300 hover:text-red-300 ml-1"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 fill-emerald-800 text-emerald-800" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-none">
              Shop<span className="text-emerald-300">Nest</span>
            </span>
            <span className="text-[9px] text-emerald-200/80 uppercase tracking-wider font-semibold">
              Quality Store
            </span>
          </div>
        </Link>


        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-sm border border-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
          </div>
        </form>

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link / Indicator */}
          <Link
            href="/wishlist"
            className="p-2 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon with emerald badge */}
          <Link
            href="/cart"
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-2 shadow-sm"
            title="View Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-emerald-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
