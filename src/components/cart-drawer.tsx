"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CART_DRAWER_TOGGLE } from "./navbar";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_VARIANTS = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  const subtotal = totalPrice();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Sync with navbar toggle event
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener(CART_DRAWER_TOGGLE, handler);
    return () => window.removeEventListener(CART_DRAWER_TOGGLE, handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            variants={DRAWER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <h2 className="text-base font-semibold text-white">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="text-xs text-white/50 pl-1">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <EmptyCart onClose={onClose} />
            ) : (
              <>
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 50, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                          <Image
                            src={item.image || "https://picsum.photos/200"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Size/Color */}
                          {(item.size || item.color) && (
                            <div className="flex items-center gap-2 mt-1">
                              {item.size && (
                                <span className="text-xs text-white/40">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-xs text-white/40">
                                  {item.size ? "•" : ""} {item.color}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-white/10 rounded-full overflow-hidden">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs text-white font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <span className="text-sm font-semibold text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer: Subtotal & Actions */}
                <div className="border-t border-white/10 px-6 py-5 space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Subtotal</span>
                    <span className="text-base font-semibold text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-white/30">
                    Shipping and taxes calculated at checkout.
                  </p>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
                    >
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-full border border-white/20 text-white/80 font-medium text-sm hover:border-white/40 hover:text-white transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
        <ShoppingBag className="w-8 h-8 text-white/30" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
      <p className="text-sm text-white/40 mb-8 leading-relaxed max-w-xs">
        Looks like you haven&apos;t added any items yet. Start exploring our collection.
      </p>
      <Link
        href="/products"
        onClick={onClose}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
      >
        Browse Products
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
