import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
  title: "ShopNest - Curated Lifestyle & Tech Store",
  description:
    "FastAPI + Native PostgreSQL + Next.js Mini Ecommerce with JWT Auth and Admin Inventory Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </WishlistProvider>
            <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© {new Date().getFullYear()} ShopNest. All rights reserved.</p>
                <div className="flex items-center gap-6 font-medium text-slate-500">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                  <span>Contact: support@shopnest.com</span>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
