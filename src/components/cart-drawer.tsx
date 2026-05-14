"use client";

import { useEffect } from "react";
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
    transition: { type: "spring" as const, damping: 28, stiffness: 300 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: "easeIn" as const },
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
    return () => { document.body.style.overflow = ""; };
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
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            variants={DRAWER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-[420px] bg-white border-l border-[#E5E5E0] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E0]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#141413]" strokeWidth={1.8} />
                <h2 className="text-base font-semibold text-[#141413]">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="text-xs text-[#6B6B67] pl-1">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-[10px] text-[#6B6B67] hover:text-[#141413] hover:bg-[#F4F4F1] transition-all"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" strokeWidth={1.8} />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <EmptyCart onClose={onClose} />
            ) : (
              <>
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                        {/* Product Image placeholder */}
                        <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-[#F4F4F1] border border-[#E5E5E0] shrink-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-[#D4D4CC]">
                            {item.name?.charAt(0) || "?"}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-medium text-[#141413] line-clamp-2 leading-snug">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 p-1 rounded text-[#6B6B67] hover:text-red-500 hover:bg-red-50 transition-all"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={1.8} />
                            </button>
                          </div>

                          {/* Size/Color */}
                          {(item.size || item.color) && (
                            <div className="flex items-center gap-2 mt-1">
                              {item.size && (
                                <span className="text-xs text-[#6B6B67]">Size: {item.size}</span>
                              )}
                              {item.color && (
                                <span className="text-xs text-[#6B6B67]">
                                  {item.size ? "•" : ""} {item.color}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between mt-auto pt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-[#E5E5E0] rounded-full overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                }
                                className="w-7 h-7 flex items-center justify-center text-[#6B6B67] hover:text-[#141413] hover:bg-[#F4F4F1] transition-all"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" strokeWidth={2} />
                              </button>
                              <span className="w-8 text-center text-xs text-[#141413] font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center text-[#6B6B67] hover:text-[#141413] hover:bg-[#F4F4F1] transition-all"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" strokeWidth={2} />
                              </button>
                            </div>

                            <span className="text-[14px] font-semibold text-[#141413]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer: Subtotal & Actions */}
                <div className="border-t border-[#E5E5E0] px-6 py-5 space-y-4 bg-white">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B6B67]">Subtotal</span>
                    <span className="text-[15px] font-semibold text-[#141413]">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B67]">
                    Shipping and taxes calculated at checkout.
                  </p>

                  {/* Buttons */}
                  <div className="space-y-2.5">
                    <Link
                      href="/checkout"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[10px] bg-[#141413] text-[#FAFAF8] font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      Checkout
                      <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
                    </Link>
                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-[10px] border border-[#E5E5E0] text-[#6B6B67] font-medium text-sm hover:bg-[#F4F4F1] hover:text-[#141413] transition-all"
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
      <div className="w-20 h-20 rounded-full bg-[#F4F4F1] border border-[#E5E5E0] flex items-center justify-center mb-5">
        <ShoppingBag className="w-8 h-8 text-[#D4D4CC]" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-[#141413] mb-2">Your cart is empty</h3>
      <p className="text-sm text-[#6B6B67] mb-8 leading-relaxed max-w-xs">
        Looks like you haven&apos;t added any items yet. Start exploring our collection.
      </p>
      <Link
        href="/products"
        onClick={onClose}
        className="flex items-center gap-2 px-8 py-3 rounded-[10px] bg-[#141413] text-[#FAFAF8] font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Browse Products
        <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
      </Link>
    </div>
  );
}