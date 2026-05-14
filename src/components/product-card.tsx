"use client";

import { useState } from "react";
import Image from "next/image";
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
  const isDiscounted = original_price !== null && original_price > price;
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
    setTimeout(() => { setIsAdding(false); setAdded(false); }, 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/products/${id}`}
        className="block rounded-2xl border border-border overflow-hidden bg-card transition-all duration-300 hover:border-foreground/30 hover:shadow-md"
      >
        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Placeholder — no images seeded */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground/10 select-none">
              {name.charAt(0)}
            </span>
          </div>

          {/* Discount badge */}
          {isDiscounted && (
            <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-bold px-2.5 py-1 rounded-full">
              -{discountPct}%
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
              "transition-all duration-200 z-10",
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background"
            )}
          >
            <Heart className={cn("w-4 h-4", inWishlist ? "fill-current" : "")} />
          </button>

          {/* Quick-add overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered && !isOutOfStock ? 1 : 0, y: isHovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 p-3"
          >
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={cn(
                "w-full py-2.5 rounded-full text-xs font-semibold transition-all duration-200",
                "flex items-center justify-center gap-1.5",
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-foreground text-background hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              )}
            >
              {added ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <h3 className="text-sm font-medium line-clamp-2 leading-snug text-foreground">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              ${price.toLocaleString()}
            </span>
            {isDiscounted && original_price && (
              <span className="text-xs text-muted-foreground line-through">
                ${original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}