"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => boolean;
  clearCart: () => void;
  totalItemsCount: number;
  subtotalMRP: number;
  totalDiscount: number;
  finalPayableAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mini_ecommerce_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to read cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("mini_ecommerce_cart", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to write cart to localStorage", e);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message?: string } => {
    const stockNum = typeof product.stock === "number" ? product.stock : parseInt(String(product.stock), 10) || 0;

    // Stock = 0: Out of Stock, disabled from adding to cart
    if (stockNum <= 0) {
      return { success: false, message: "This item is currently Out of Stock." };
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const desiredQty = currentQty + quantity;

      // Cannot order quantity greater than available stock
      if (desiredQty > stockNum) {
        return {
          success: false,
          message: `Cannot add more. Available stock limit is ${stockNum}.`,
        };
      }

      const updated = [...cart];
      updated[existingIndex].quantity = desiredQty;
      setCart(updated);
      return { success: true };
    } else {
      if (quantity > stockNum) {
        return {
          success: false,
          message: `Cannot order ${quantity} items. Available stock is ${stockNum}.`,
        };
      }
      setCart([...cart, { product, quantity }]);
      return { success: true };
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number): boolean => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const item = cart.find((i) => i.product.id === productId);
    if (!item) return false;

    // Check stock limit
    if (newQuantity > item.product.stock) {
      return false; // exceeds available stock
    }

    setCart(
      cart.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQuantity } : i
      )
    );
    return true;
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Subtotal calculated at MRP
  const subtotalMRP = cart.reduce(
    (acc, item) => acc + item.product.mrp * item.quantity,
    0
  );

  // Final payable amount calculated at Selling Price
  const finalPayableAmount = cart.reduce(
    (acc, item) => acc + item.product.selling_price * item.quantity,
    0
  );

  // Total discount saved
  const totalDiscount = Math.max(0, subtotalMRP - finalPayableAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotalMRP,
        totalDiscount,
        finalPayableAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
