"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchProductById,
  fetchSimilarProducts,
  fetchRecommendedProducts,
  Product,
} from "@/lib/api";
import { StockBadge } from "@/components/StockBadge";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingCart,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Barcode,
  Layers,
  Star,
  Heart,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "shipping">("specs");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Pincode availability state
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<{
    available: boolean;
    message: string;
    date?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quantity selector state
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const productId = params?.id as string;
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleCheckPincode = () => {
    const cleaned = pincodeInput.trim();
    if (/^\d{6}$/.test(cleaned)) {
      setPincodeStatus({
        available: true,
        message: `Delivery available to ${cleaned}`,
        date: "Express dispatch: Delivery within 2-4 business days | Free Delivery on orders > ₹999",
      });
    } else {
      setPincodeStatus({
        available: false,
        message: "Please enter a valid 6-digit Indian PIN code (e.g. 560001)",
      });
    }
  };

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductById(productId)
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.image_url || null);

        // Save & load recently viewed
        try {
          const stored = localStorage.getItem("shopnest_recently_viewed");
          const list: Product[] = stored ? JSON.parse(stored) : [];
          const updated = [data, ...list.filter((p) => p.id !== data.id)].slice(0, 8);
          localStorage.setItem("shopnest_recently_viewed", JSON.stringify(updated));
          setRecentlyViewed(list.filter((p) => p.id !== data.id).slice(0, 6));
        } catch {}

        // Fetch similar and recommended in parallel
        fetchSimilarProducts(productId).then(setSimilarProducts);
        fetchRecommendedProducts(productId).then(setRecommendedProducts);
      })
      .catch((err) => {
        setError(err.message || "Failed to load product details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">{error || "The requested product does not exist."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const numericStock = typeof product.stock === "number" ? product.stock : parseInt(String(product.stock), 10) || 0;
  const existingInCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
  const remainingStock = Math.max(0, numericStock - existingInCart);
  const isOutOfStock = numericStock <= 0;

  const handleIncreaseQty = () => {
    if (quantity < remainingStock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    setCartError(null);
    const result = addToCart(product, quantity);
    if (result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } else if (result.message) {
      setCartError(result.message);
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

  const savingsAmount = product.mrp > product.selling_price ? product.mrp - product.selling_price : 0;
  const formattedSavings = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(savingsAmount);

  // Fallback thumbnails for gallery preview
  const galleryImages = [
    product.image_url,
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${encodeURIComponent(product.category)}`}
          className="hover:text-emerald-700 transition"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
        {/* Left: Gallery & Main Image Preview */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row-reverse gap-4 items-center sm:items-start">
          {/* Main Large Image */}
          <div className="w-full flex-1 aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative group">
            {product.discount_percentage > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                SAVE {product.discount_percentage}%
              </div>
            )}
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                No Image Available
              </div>
            )}
          </div>

          {/* Vertical Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition ${
                    selectedImage === img
                      ? "border-emerald-700 shadow-md"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand & Stock Pill */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                {product.brand}
              </span>
              <StockBadge stock={product.stock} stockStatus={product.stock_status} size="md" />
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Star Rating Display */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4.5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {product.rating ? product.rating.toFixed(1) : "4.5"}
              </span>
              <span className="text-xs text-slate-400">
                ({product.rating_count || 128} customer reviews)
              </span>
            </div>

            {/* Identification Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">SKU:</span>
                <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[11px]">
                  {product.sku}
                </code>
              </div>
              {product.barcode && (
                <div className="flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Barcode:</span>
                  <span className="font-mono text-[11px]">{product.barcode}</span>
                </div>
              )}
              {product.subcategory && (
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>{product.subcategory}</span>
                </div>
              )}
            </div>

            {/* Pricing Box */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">{formattedSellingPrice}</span>
                {product.mrp > product.selling_price && (
                  <span className="text-sm text-slate-400 line-through font-normal">
                    {formattedMRP}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                    {product.discount_percentage}% OFF
                  </span>
                )}
              </div>
              {savingsAmount > 0 && (
                <p className="text-xs font-medium text-emerald-800">
                  You save {formattedSavings} off MRP inclusive of all taxes.
                </p>
              )}
            </div>

            {/* Key Features Bullet List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Highlights
              </span>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Premium high-durability verified materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>100% Brand original with manufacturer warranty</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Dispatched within 24 hours with trackable delivery</span>
                </li>
              </ul>
            </div>

            {/* Quantity Selector & Stock Limits */}
            {!isOutOfStock && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncreaseQty}
                      disabled={quantity >= remainingStock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs text-slate-500">
                    Available inventory: <strong className="text-slate-800">{product.stock}</strong> units
                    {existingInCart > 0 && (
                      <span className="text-emerald-700 ml-1">({existingInCart} in cart)</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {cartError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cartError}</span>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Wishlist */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || remainingStock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                  isOutOfStock || remainingStock <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : addedSuccess
                    ? "bg-emerald-600 text-white shadow-emerald-200"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-200"
                }`}
              >
                {isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : remainingStock <= 0 ? (
                  <span>All Available In Cart</span>
                ) : addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart ({quantity})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm border transition flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? "border-rose-300 bg-rose-50 text-rose-600 shadow-sm"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
                <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
              </button>

              <button
                onClick={() => router.push("/cart")}
                className="py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center"
              >
                Go to Cart
              </button>
            </div>

            {/* Pincode Delivery Availability Check */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Check Delivery & Pincode Availability</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode (e.g. 560001)"
                  className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCheckPincode}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    pincodeStatus.available
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {pincodeStatus.available ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold">{pincodeStatus.message}</div>
                    {pincodeStatus.date && (
                      <div className="text-[11px] text-slate-600">{pincodeStatus.date}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Truck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">Fast Shipping</div>
              <div className="text-[10px] text-slate-400">All India Delivery</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <RotateCcw className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">7-Day Returns</div>
              <div className="text-[10px] text-slate-400">Simple Exchange</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800">100% Genuine</div>
              <div className="text-[10px] text-slate-400">Direct from Brand</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Specifications, Reviews, Shipping */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "specs"
                ? "border-emerald-700 text-emerald-800 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "reviews"
                ? "border-emerald-700 text-emerald-800 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Customer Reviews ({product.rating_count || 128})
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 border-b-2 transition ${
              activeTab === "shipping"
                ? "border-emerald-700 text-emerald-800 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Shipping &amp; Policy
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "specs" && (
          <div>
            {product.specifications_dict && Object.keys(product.specifications_dict).length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {Object.entries(product.specifications_dict).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 p-3 bg-slate-50/50 hover:bg-slate-50">
                    <span className="font-semibold text-slate-600">{key}</span>
                    <span className="col-span-2 text-slate-800 font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            ) : product.specifications ? (
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                {product.specifications}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional specifications listed.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
              <span className="text-3xl font-black text-emerald-800">
                {product.rating ? product.rating.toFixed(1) : "4.5"}
              </span>
              <div>
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Based on {product.rating_count || 128} verified customer ratings
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">Rahul Sharma</span>
                  <span className="text-[11px] text-slate-400">Verified Buyer</span>
                </div>
                <div className="flex text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Exceptional build quality and fast delivery. Exceeded expectations!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              • <strong>Standard Shipping</strong>: Orders dispatched within 24 business hours. Arrives in 2-4 business days.
            </p>
            <p>
              • <strong>Return Policy</strong>: Easy 7-day return window from the date of delivery for all unopened or defective products.
            </p>
            <p>
              • <strong>Packaging Guarantee</strong>: Packed with eco-friendly shockproof cushioning.
            </p>
          </div>
        )}
      </div>

      {/* Similar Products Strip */}
      {similarProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Similar Products</h2>
            <Link
              href={`/?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View More
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Strip */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products Strip */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
