"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  primary_image?: string;
  avg_rating?: number;
  stock_quantity?: number;
  is_active: boolean;
  created_at: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string };
}

// Skeleton loader
function WishlistSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="aspect-square bg-white/5" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-4 bg-white/5 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API and filter by wishlist IDs
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products (limit high to get all)
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();

        if (data.products) {
          // Filter to only wishlisted products
          const wishlisted = data.products.filter((p: Product) =>
            wishlistItems.includes(p.id)
          );
          setProducts(wishlisted);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistItems]);

  const handleRemove = useCallback(
    (id: string) => {
      removeFromWishlist(id);
    },
    [removeFromWishlist]
  );

  const isEmpty = wishlistItems.length === 0;
  const isLoading = loading;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)]">My Wishlist</h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {isLoading
              ? "Loading..."
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isEmpty && !isLoading ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[var(--text-secondary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
              Save your favorite products here so you can easily find them later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--accent)]/90 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Loading Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <WishlistSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Wishlist Grid */}
            {!isLoading && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              >
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.compare_at_price}
                      image={product.primary_image || "https://picsum.photos/400"}
                      rating={product.avg_rating}
                      category={product.category?.name}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Products in wishlist that couldn't be loaded */}
            {!isLoading && wishlistItems.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)] text-center">
                  {products.length} of {wishlistItems.length} items found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
