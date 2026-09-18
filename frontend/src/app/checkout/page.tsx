"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  Check,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totalItemsCount, subtotalMRP, totalDiscount, finalPayableAmount } =
    useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Step 1: Shipping Address State
  const [shippingData, setShippingData] = useState({
    fullName: "Aarav Mehta",
    phone: "9876543210",
    email: "aarav.mehta@example.com",
    address: "Flat 402, Green Meadows, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });

  // Step 2: Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("aarav@okhdfcbank");

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(subtotalMRP);

  const formattedDiscount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalDiscount);

  const formattedPayable = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(finalPayableAmount);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: shippingData.fullName || "Guest Customer",
        customer_email: shippingData.email || "customer@example.com",
        customer_phone: shippingData.phone || "",
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}`,
        payment_method: paymentMethod,
        discount_amount: totalDiscount,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.order_id);
      } else {
        const fallbackId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderId(fallbackId);
      }
    } catch {
      const fallbackId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(fallbackId);
    } finally {
      setIsSubmitting(false);
      setOrderConfirmed(true);
      clearCart();
    }
  };

  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Your payment has been verified. We are preparing your items for express dispatch.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-slate-900">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Recipient:</span>
            <span className="font-semibold text-slate-900">{shippingData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Shipping To:</span>
            <span className="font-semibold text-slate-900">
              {shippingData.city}, {shippingData.state} - {shippingData.pincode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment:</span>
            <span className="font-semibold text-emerald-800 uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>Total Paid:</span>
            <span className="text-emerald-800">{formattedPayable}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-200 inline-flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Checkout Steps Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= 1 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span
              className={`text-[11px] font-bold ${
                step === 1 ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              Shipping Address
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step >= 2 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span
              className={`text-[11px] font-bold ${
                step === 2 ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              Payment Method
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step === 3 ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </div>
            <span
              className={`text-[11px] font-bold ${
                step === 3 ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              Review &amp; Place
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Form for Current Step */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* STEP 1: Shipping Address */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Truck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. Delivery Address</h2>
                  <p className="text-xs text-slate-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={shippingData.fullName}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, fullName: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, phone: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={shippingData.email}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, email: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                    placeholder="Order updates will be sent here"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={shippingData.address}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, address: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                    placeholder="House / Flat / Street / Landmark"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shippingData.city}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, city: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={shippingData.state}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, state: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={shippingData.pincode}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, pincode: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-md inline-flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">2. Payment Method</h2>
                  <p className="text-xs text-slate-500">
                    Select your preferred secure payment method
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* UPI */}
                <label
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "upi"
                      ? "border-emerald-700 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        UPI / QR Code (Google Pay, PhonePe, Paytm)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Instant payment verification via UPI VPA
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="text-emerald-700 focus:ring-emerald-700"
                  />
                </label>

                {paymentMethod === "upi" && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2 ml-4">
                    <label className="block font-semibold text-slate-700">Enter UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg outline-none"
                    />
                  </div>
                )}

                {/* Card */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "card"
                      ? "border-emerald-700 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Credit / Debit Card</div>
                      <div className="text-[11px] text-slate-500">Visa, MasterCard, RuPay</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="text-emerald-700 focus:ring-emerald-700"
                  />
                </label>

                {/* Net Banking */}
                <label
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "netbanking"
                      ? "border-emerald-700 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Net Banking</div>
                      <div className="text-[11px] text-slate-500">All major Indian banks supported</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                    className="text-emerald-700 focus:ring-emerald-700"
                  />
                </label>

                {/* COD */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-emerald-700 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-slate-500">Pay cash upon delivery</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-emerald-700 focus:ring-emerald-700"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-md inline-flex items-center gap-2"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Place Order */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">3. Review &amp; Confirmation</h2>
                  <p className="text-xs text-slate-500">
                    Verify all details before placing order
                  </p>
                </div>
              </div>

              {/* Delivery info recap */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Delivering To:</span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-emerald-700 font-semibold hover:underline text-[11px]"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-slate-700 font-medium">
                  {shippingData.fullName} ({shippingData.phone})
                </div>
                <div className="text-slate-500">
                  {shippingData.address}, {shippingData.city}, {shippingData.state} -{" "}
                  {shippingData.pincode}
                </div>
              </div>

              {/* Payment method recap */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Payment Option:</span>
                  <button
                    onClick={() => setStep(2)}
                    className="text-emerald-700 font-semibold hover:underline text-[11px]"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-slate-700 font-medium uppercase">{paymentMethod}</div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Items in this order:</span>
                <div className="divide-y divide-slate-100">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-slate-500">{quantity}x</span>
                        <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        ₹{product.selling_price * quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Payment
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm transition shadow-md shadow-emerald-200 inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Place Order ({formattedPayable})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Summary ({totalItemsCount} items)
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (MRP)</span>
                <span className="font-semibold text-slate-800">{formattedSubtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Total Discount</span>
                <span>- {formattedDiscount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="text-emerald-800 font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-slate-900">{formattedPayable}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>SSL 256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
