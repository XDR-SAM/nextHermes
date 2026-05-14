"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  primary_image?: string;
  avg_rating?: number;
  stock_quantity?: number;
  created_at: string;
  category?: { id: string; name: string; slug: string };
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5E0]">
        <div className="aspect-square bg-[#F4F4F1]" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-[#F4F4F1] rounded w-1/3" />
          <div className="h-4 bg-[#F4F4F1] rounded w-3/4" />
          <div className="h-3 bg-[#F4F4F1] rounded w-1/4" />
          <div className="h-8 bg-[#F4F4F1] rounded w-1/2 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Try "rating" sort as a proxy for best sellers
        const res = await fetch("/api/products?sort=rating&limit=20");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#141413]">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-3xl mx-auto relative">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-4"
          >
            Top Rated
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Best Sellers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#6B6B67]"
          >
            Our most-loved products, chosen by thousands of happy customers.
            Discover what everyone is talking about.
          </motion.p>
        </div>
      </section>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B6B67]">No best sellers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
