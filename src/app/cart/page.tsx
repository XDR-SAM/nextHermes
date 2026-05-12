"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.08; // 8% tax

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [checkoutAlert, setCheckoutAlert] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleClearCart = () => {
    setClearing(true);
    setTimeout(() => {
      clearCart();
      setClearing(false);
    }, 300);
  };

  const handleCheckout = () => {
    // Checkout not implemented yet — show alert
    setCheckoutAlert(true);
    setTimeout(() => setCheckoutAlert(false), 3000);
  };

  // Don't render store data until mounted (to avoid hydration mismatch with localStorage)
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading cart...</p>
        </div>
      </main>
    );
  }

  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Checkout Alert */}
      {checkoutAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--accent)] text-[var(--bg)] px-6 py-3 rounded-full font-semibold text-sm shadow-xl"
        >
          Checkout coming soon! 🚀
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-2">
                Shopping Cart
              </h1>
              <p className="text-[var(--text-secondary)]">
                {items.length} item{items.length !== 1 ? "s" : ""} —{" "}
                {items.reduce((sum, item) => sum + item.quantity, 0)} total quantity
              </p>
            </div>
            {!isEmpty && (
              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? "Clearing..." : "Clear cart"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isEmpty ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingCart className="w-12 h-12 text-[var(--text-secondary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
              Your cart is empty
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
              Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--accent)]/90 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 min-w-0">
              {/* Free Shipping Progress */}
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-4 h-4 text-[var(--text-secondary)]" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      Add{" "}
                      <span className="text-[var(--accent)] font-semibold">
                        ${amountToFreeShipping.toFixed(2)}
                      </span>{" "}
                      more for free shipping!
                    </p>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-[var(--accent)] rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Cart Line Items */}
              <div className="space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={cn(
                      "bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 transition-all",
                      clearing && "opacity-50 scale-[0.98]"
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.id}`}
                        className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-[var(--border)]"
                      >
                        <Image
                          src={item.image || "https://picsum.photos/200"}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            href={`/products/${item.id}`}
                            className="text-sm font-semibold text-[var(--text)] hover:text-[var(--text-secondary)] transition-colors line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variants */}
                        {(item.color || item.size) && (
                          <div className="flex gap-2 mb-2">
                            {item.color && (
                              <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-2 py-0.5 rounded-full">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-xs text-[var(--text-secondary)] bg-white/5 px-2 py-0.5 rounded-full">
                                {item.size}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-white/5 border border-[var(--border)] rounded-xl">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-[var(--text)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-[var(--text)]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                ${item.price.toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 sticky top-8"
              >
                <h2 className="text-lg font-semibold text-[var(--text)] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                      Shipping
                      {shipping === 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded-full">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
                    <span className="font-semibold text-[var(--text)]">Total</span>
                    <span className="text-xl font-bold text-[var(--text)]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-full bg-[var(--accent)] text-[var(--bg)] font-semibold text-sm hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <Shield className="w-4 h-4 shrink-0" />
                    Secure 256-bit SSL encryption
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    30-day hassle-free returns
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <Truck className="w-4 h-4 shrink-0" />
                    Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
