"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Star, Check, Quote, Shirt, Gem, Watch, Smartphone } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// Types
interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  background_image?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  images: string[];
  rating?: number;
  review_count?: number;
  category?: string;
  category_id?: string;
  is_trending?: boolean;
  is_featured?: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  verified: boolean;
  avatar?: string;
}

interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
}

// Category icon mapping
const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("men") || lower.includes("clothing")) return Shirt;
  if (lower.includes("women") || lower.includes("fashion")) return Gem;
  if (lower.includes("watch") || lower.includes("accessories")) return Watch;
  if (lower.includes("phone") || lower.includes("electronics")) return Smartphone;
  return Gem;
};

// Skeleton loader
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-white/5 rounded-lg", className)} />
  );
}

// Animated section wrapper
function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Error boundary fallback
function ErrorFallback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] dark:bg-black flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-[var(--text-secondary)] dark:text-white/60 mb-4">{message}</p>
        <button onClick={onRetry} className="bg-[var(--accent)] text-[var(--bg)] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}

// HERO SECTION
function HeroSection({ settings, heroBanners }: { settings: SiteSettings | null; heroBanners: Banner[] }) {
  const activeHero = heroBanners.find((b) => b.is_active) || heroBanners[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={activeHero?.background_image ? {
        backgroundImage: `url(${activeHero.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : activeHero?.background_color ? {
        backgroundColor: activeHero.background_color,
      } : undefined}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants}>
              <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/70 border border-white/20 rounded-full px-4 py-1.5">
                {activeHero?.subtitle || "New Collection 2025"}
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.9] tracking-tight">
              {activeHero?.title || settings?.hero_title || "Redefine"}{" "}
              <span className="block mt-2">
                Your{" "}
                <span className="relative">
                  Style
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-white" />
                </span>
              </span>
            </motion.h1>

            {activeHero?.description && (
              <motion.p variants={itemVariants} className="text-lg text-white/70 max-w-md leading-relaxed">
                {activeHero.description}
              </motion.p>
            )}

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <Link
                href={activeHero?.cta_link || settings?.hero_cta_link || "/products"}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {activeHero?.cta_text || settings?.hero_cta_text || "Shop Now"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Explore Collection
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-6">
              <div>
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">4.9</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">200+</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">Premium Brands</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center">
                    <span className="text-6xl font-light text-white/20">H</span>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
              >
                <p className="text-xs text-white/60">Featured</p>
                <p className="text-sm font-semibold text-white">Leather Jacket</p>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-white">4.9</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/30">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// FEATURED CATEGORIES
function CategoriesSection({ categories, loading }: { categories: Category[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 bg-[var(--bg-secondary)] dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[var(--bg-secondary)] dark:bg-black">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] dark:text-white/40">Browse By</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] dark:text-white mt-3">Featured Categories</h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.slice(0, 4).map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <AnimatedSection key={category.id} delay={index * 0.1}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group relative bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-[var(--border)] dark:border-white/5 rounded-2xl p-6 lg:p-8 overflow-hidden transition-all duration-500 hover:border-[var(--text-secondary)] dark:hover:border-white/15 hover:translate-y-[-4px] hover:shadow-2xl dark:hover:shadow-black/50"
                >
                  <div className="absolute inset-0 bg-[var(--glass-bg)] dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--glass-bg)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-6 h-6 text-[var(--text-secondary)] dark:text-white/70" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text)] dark:text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] dark:text-white/40">{category.product_count || 0} items</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-[var(--glass-bg)] dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-[-4px]">
                    <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] dark:text-white/70" />
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// TRENDING PRODUCTS
function TrendingSection({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 bg-[var(--bg)] dark:bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--bg)] dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] dark:text-white/40">Hot Right Now</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] dark:text-white mt-3">Trending Now</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] dark:text-white/60 hover:text-[var(--text)] dark:hover:text-white transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 6).map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.08}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images?.[0] || "https://picsum.photos/400"}
                rating={product.rating}
                reviewCount={product.review_count}
                category={product.category}
              />
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-10 text-center sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-[var(--text-secondary)] dark:text-white/60 hover:text-[var(--text)] dark:hover:text-white transition-colors">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

// PROMO BANNER
function PromoBanner({ banners, loading }: { banners: Banner[]; loading: boolean }) {
  // promo_banners: image banners = hero, color-only = promo
  const activeBanners = banners.filter((b) => b.is_active);
  const activeBanner = activeBanners[0];

  if (loading) {
    return (
      <section className="py-20 bg-[var(--bg-secondary)] dark:bg-black relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </section>
    );
  }

  if (!activeBanner) return null;

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={activeBanner?.background_image ? {
        backgroundImage: `url(${activeBanner.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : activeBanner?.background_color ? {
        backgroundColor: activeBanner.background_color,
      } : undefined}
    >
      <div className="absolute inset-0 bg-black/70" />

      <AnimatedSection className="container mx-auto px-6 relative z-10">
        <div className="relative border border-white/10 rounded-3xl p-8 lg:p-16 overflow-hidden"
          style={activeBanner?.background_image ? {
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
          } : activeBanner?.background_color ? {
            background: `${activeBanner.background_color}cc`,
          } : undefined}
        >
          <div className="absolute top-0 right-0 w-64 h-64 border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            {activeBanner.subtitle && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-xs uppercase tracking-[0.3em] text-white/70 border border-white/20 rounded-full px-4 py-1.5 mb-6"
              >
                {activeBanner.subtitle}
              </motion.span>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
            >
              {activeBanner.title}
            </motion.h2>

            {activeBanner.description && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/60 mb-8"
              >
                {activeBanner.description}
              </motion.p>
            )

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href={activeBanner.cta_link || "/products"}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {activeBanner.cta_text || "Shop Now"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

// NEW ARRIVALS
function NewArrivalsSection({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 bg-[var(--bg)] dark:bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-12 w-48" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--bg)] dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] dark:text-white/40">Just Dropped</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] dark:text-white mt-3">New Arrivals</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-[var(--text-secondary)] dark:text-white/60 hover:text-[var(--text)] dark:hover:text-white transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 4).map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.1}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images?.[0] || "https://picsum.photos/400"}
                rating={product.rating}
                reviewCount={product.review_count}
                category={product.category}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// TESTIMONIALS
function TestimonialsSection({ testimonials, loading }: { testimonials: Testimonial[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 bg-[var(--bg-secondary)] dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--bg-secondary)] dark:bg-black">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] dark:text-white/40">Reviews</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] dark:text-white mt-3">What Our Customers Say</h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} delay={index * 0.15}>
              <div className="relative bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950 border border-[var(--border)] dark:border-white/5 rounded-2xl p-8 h-full hover:border-[var(--text-secondary)] dark:hover:border-white/10 transition-colors">
                <Quote className="w-10 h-10 text-[var(--text-secondary)] dark:text-white/10 mb-6" />

                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-[var(--text-secondary)] dark:text-white/70 leading-relaxed mb-8 text-sm lg:text-base">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--glass-bg)] dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 flex items-center justify-center overflow-hidden">
                    {testimonial.avatar ? (
                      <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-[var(--text)] dark:text-white">
                        {testimonial.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)] dark:text-white flex items-center gap-2">
                      {testimonial.name}
                      {testimonial.verified && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] dark:text-white/40">Verified Customer</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// NEWSLETTER
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // In a real app, you would save this to Supabase
      // await supabase.from('newsletter_subscribers').insert({ email });
      setSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-[var(--bg)] dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] dark:text-white/40">Stay Updated</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--text)] dark:text-white mt-3 mb-4">
            Join the Hermes Community
          </h2>
          <p className="text-[var(--text-secondary)] dark:text-white/50 mb-10 max-w-md mx-auto">
            Subscribe to receive exclusive offers, early access to new arrivals, and style inspiration delivered to your inbox.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-[var(--glass-bg)] dark:bg-white/5 border border-[var(--border)] dark:border-white/10 rounded-full px-6 py-4 text-[var(--text)] dark:text-white placeholder:text-[var(--text-secondary)] dark:placeholder:text-white/30 focus:outline-none focus:border-[var(--text-secondary)] dark:focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all duration-300 whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-full"
            >
              <Check className="w-5 h-5" />
              <span>Welcome to the community! Check your inbox for a special offer.</span>
            </motion.div>
          )}

          <p className="text-xs text-[var(--text-secondary)] dark:text-white/30 mt-6">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// MAIN PAGE
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      // Fetch trending products (no FK join — flat columns)
      const { data: trendingData } = await supabase
        .from("products")
        .select("*")
        .eq("is_trending", true)
        .eq("is_active", true)
        .limit(6);

      // Fetch featured products (new arrivals)
      const { data: featuredData } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(4);

      // Fetch testimonials
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      // Fetch banners from promo_banners table
      const { data: bannersData } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      // Map promo_banners columns → Banner interface
      const mappedBanners: Banner[] = (bannersData || []).map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || "",
        description: b.subtitle || "",
        cta_text: b.link_text || "Shop Now",
        cta_link: b.link || "/products",
        background_image: b.background_image,
        background_color: b.background_color,
        text_color: b.text_color,
        sort_order: b.sort_order ?? 0,
        is_active: b.is_active ?? false,
        created_at: b.created_at,
      }));

      // Fetch site settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      // Transform data
      const transformedTrending = (trendingData || []).map((p: any) => ({
        ...p,
        images: p.images || [],
      }));

      const transformedFeatured = (featuredData || []).map((p: any) => ({
        ...p,
        images: p.images || [],
      }));

      setCategories(categoriesData || []);
      setTrendingProducts(transformedTrending);
      setFeaturedProducts(transformedFeatured);
      setTestimonials(testimonialsData || []);
      setBanners(mappedBanners);
      setSiteSettings(settingsData);
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return <ErrorFallback message={error} onRetry={fetchData} />;
  }

  // promo_banners: has background_image → hero; color-only → promo
  const heroBanners = banners.filter((b) => b.background_image);

  return (
    <main className="bg-[var(--bg)] dark:bg-black min-h-screen">
      <HeroSection settings={siteSettings} heroBanners={heroBanners} />
      <CategoriesSection categories={categories} loading={loading} />
      <TrendingSection products={trendingProducts} loading={loading} />
      <PromoBanner banners={banners} loading={loading} />
      <NewArrivalsSection products={featuredProducts} loading={loading} />
      <TestimonialsSection testimonials={testimonials} loading={loading} />
      <NewsletterSection />
    </main>
  );
}
