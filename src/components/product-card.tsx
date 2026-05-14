"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

// Minimal product shape — pages only pass a subset of fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductCore = any;

// ─── ProductCard ──────────────────────────────────────────────────────────────
export function ProductCard({ product }: { product: ProductCore }) {
  const { id, name, price, original_price, stock_quantity, stock_status } = product;
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(id);
  const isDiscounted = original_price != null && original_price > price;
  const discountPct = isDiscounted
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;
  const isOutOfStock = stock_status === "out_of_stock" || (stock_quantity ?? 0) === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || isOutOfStock) return;

    setIsAdding(true);
    addItem({ id, name, price, image: "", quantity: 1 });
    setAdded(true);
    setTimeout(() => { setIsAdding(false); setAdded(false); }, 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products/${id}`}
        className="block rounded-[16px] border border-[#E5E5E0] overflow-hidden bg-white transition-all duration-300 hover:border-[#D4D4CC] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
      >
        {/* Image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F4F4F1]">
          {/* Sophisticated placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-[#E5E5E0] flex items-center justify-center bg-white/60">
                <span className="text-3xl font-bold text-[#D4D4CC] select-none">
                  {name.charAt(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Discount badge */}
          {isDiscounted && (
            <div className="absolute top-3 left-3 bg-[#141413] text-[#FAFAF8] text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
              -{discountPct}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-medium tracking-[0.12em] uppercase text-[#6B6B67] bg-white/80 px-4 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10",
              inWishlist
                ? "bg-red-500 text-white shadow-sm"
                : "bg-white/80 backdrop-blur-sm text-[#6B6B67] hover:text-red-500 hover:bg-white shadow-sm"
            )}
          >
            <Heart
              className={cn("w-4 h-4", inWishlist ? "fill-current" : "")}
              strokeWidth={1.8}
            />
          </button>

          {/* Quick-add overlay — slides up from bottom */}
          {!isOutOfStock && (
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 p-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  "w-full py-2.5 rounded-[10px] text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                  added
                    ? "bg-[#16A34A] text-white"
                    : "bg-[#141413] text-[#FAFAF8] hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
                )}
              >
                {added ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </>
                ) : isAdding ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Adding</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.8} />
                    Add to Cart
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <h3 className="text-[13px] font-medium leading-snug text-[#141413] line-clamp-2">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[14px] font-semibold text-[#141413]">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
            {isDiscounted && original_price && (
              <span className="text-[12px] text-[#6B6B67] line-through">
                ${original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}