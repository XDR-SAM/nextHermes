"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { supabase } from "@/lib/supabase-client";
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
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5E0]">
        <div className="aspect-square bg-[#F4F4F1]" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-[#F4F4F1] rounded w-3/4" />
          <div className="h-4 bg-[#F4F4F1] rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Sync wishlist with Supabase
  const syncWithSupabase = useCallback(async () => {
    if (!userId) return;
    
    setSyncing(true);
    try {
      // Get current wishlist items from Supabase
      const { data: supabaseWishlist } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", userId);

      const supabaseProductIds = new Set<string>((supabaseWishlist || []).map((w: { product_id: unknown }) => String(w.product_id)));
      
      // Items in local store but not in Supabase - add them
      for (const productId of wishlistItems) {
        if (!supabaseProductIds.has(productId)) {
          await supabase.from("wishlists").insert({
            user_id: userId,
            product_id: productId,
          });
        }
      }
      
      // Items in Supabase but not in local store - remove them
      for (const productId of supabaseProductIds) {
        if (!wishlistItems.includes(productId)) {
          await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);
        }
      }
    } catch (error) {
      console.error("Error syncing wishlist:", error);
    } finally {
      setSyncing(false);
    }
  }, [userId, wishlistItems]);

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

    if (wishlistItems.length > 0) {
      fetchWishlistProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlistItems]);

  // Sync with Supabase when wishlist changes and user is logged in
  useEffect(() => {
    if (userId && wishlistItems.length > 0) {
      syncWithSupabase();
    }
  }, [userId, wishlistItems, syncWithSupabase]);

  const handleRemove = useCallback(
    async (id: string) => {
      removeFromWishlist(id);
      
      // Also remove from Supabase if user is logged in
      if (userId) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", id);
      }
    },
    [removeFromWishlist, userId]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.primary_image || "https://picsum.photos/400",
        quantity: 1,
      });
    },
    [addItem]
  );

  const isEmpty = wishlistItems.length === 0;
  const isLoading = loading;

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E0]">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[#141413]">My Wishlist</h1>
          </div>
          <p className="text-[#6B6B67]">
            {isLoading
              ? "Loading..."
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? "s" : ""} saved`}
            {syncing && <span className="ml-2 text-xs">(Syncing...)</span>}
            {!userId && wishlistItems.length > 0 && (
              <span className="ml-2 text-xs text-amber-400">(Sign in to sync across devices)</span>
            )}
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
            <div className="w-24 h-24 rounded-full bg-[#F4F4F1] flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[#6B6B67]" />
            </div>
            <h2 className="text-2xl font-bold text-[#141413] mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-[#6B6B67] mb-8 max-w-sm">
              Save your favorite products here so you can easily find them later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#141413] text-[#FAFAF8] px-8 py-4 rounded-full font-semibold hover:bg-[#141413]/90 transition-colors"
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
                    className="relative"
                  >
                    <ProductCard product={product} />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 left-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-red-500 hover:bg-black/80 transition-colors z-10"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Products in wishlist that couldn't be loaded */}
            {!isLoading && wishlistItems.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[#E5E5E0]">
                <p className="text-sm text-[#6B6B67] text-center">
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
