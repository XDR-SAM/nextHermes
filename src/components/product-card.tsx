"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  className?: string;
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn("w-3.5 h-3.5", i < Math.floor(rating) ? "text-yellow-400" : "text-white/20")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count !== undefined && (
        <span className="text-xs text-white/40 ml-1">({count})</span>
      )}
    </div>
  );
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount,
  category,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(id);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const isDiscounted = originalPrice && originalPrice > price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);
    addItem({
      id,
      name,
      price,
      image,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      setAddedToCart(false);
    }, 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/product/${id}`}
        className="block bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:shadow-black/50"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-white/5">
          <Image
            src={image || "https://picsum.photos/400"}
            alt={name}
            width={400}
            height={400}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered ? "scale-105" : "scale-100"
            )}
          />

          {/* Discount Badge */}
          {isDiscounted && (
            <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-black/40 text-white/70 hover:text-white hover:bg-black/60"
            )}
            style={inWishlist ? { backgroundColor: "#ef4444" } : {}}
          >
            <Heart className={cn("w-4 h-4", inWishlist ? "fill-current" : "")} />
          </button>

          {/* Quick View Overlay */}
          <motion.div
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
          >
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-4 text-sm text-white font-medium pointer-events-auto">
              <Eye className="w-4 h-4" />
              Quick View
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Category */}
          {category && (
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              {category}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-white/90 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <StarRating rating={rating} count={reviewCount} />
          )}

          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-semibold text-white">${price.toFixed(2)}</span>
            {isDiscounted && originalPrice && (
              <span className="text-xs text-white/40 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={cn(
              "mt-3 w-full py-2.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              addedToCart
                ? "bg-emerald-500 text-white"
                : "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
            )}
          >
            {addedToCart ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
