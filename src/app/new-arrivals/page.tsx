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
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="aspect-square bg-white/5" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-8 bg-white/5 rounded w-1/2 mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?sort=newest&limit=20");
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
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
            className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4"
          >
            Just Dropped
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            New Arrivals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[var(--text-secondary)]"
          >
            The latest additions to our collection — fresh styles, new ideas,
            and products worth the wait.
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
            <p className="text-[var(--text-secondary)]">No new arrivals found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : undefined}
                image={product.primary_image || "https://picsum.photos/400"}
                rating={product.avg_rating || 0}
                category={product.category?.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
