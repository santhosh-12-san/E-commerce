import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface StockBadgeProps {
  stock: number | string;
  stockStatus?: "Out of Stock" | "Only Few Left" | "In Stock" | string;
  size?: "sm" | "md" | "lg";
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  stockStatus,
  size = "md",
}) => {
  const numericStock = typeof stock === "number" ? stock : parseInt(String(stock), 10) || 0;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  }[size];

  // Stock = 0 -> "Out of Stock"
  if (numericStock <= 0 || stockStatus === "Out of Stock") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
      >
        <XCircle className="w-3.5 h-3.5 text-red-500" />
        Out of Stock
      </span>
    );
  }

  // Stock = 1 or 2 -> "Only Few Left"
  if (numericStock === 1 || numericStock === 2 || stockStatus === "Only Few Left") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse ${sizeClasses}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Only Few Left
      </span>
    );
  }

  // Stock >= 3 -> "In Stock"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      In Stock
    </span>
  );
};
