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
    <div className={cn("animate-pulse bg-muted rounded-lg", className)} />
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">{message}</p>
        <button onClick={onRetry} className="bg-foreground text-background px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}

// HERO SECTION
function HeroSection({ settings, heroBanners }: { settings: SiteSettings | null; heroBanners: Banner[] }) {
  const activeHero = heroBanners.find((b) => b.is_active) || heroBanners[0];

  const heroSectionStyle = activeHero?.background_image
    ? { backgroundImage: `url(${activeHero.background_image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : activeHero?.background_color
    ? { backgroundColor: activeHero.background_color }
    : undefined;

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
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#F4F4F1]"
    >
      {/* Warm gradient overlay — not dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF8]/80 via-[#FAFAF8]/40 to-transparent" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants}>
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-[#6B6B67] border border-[#E5E5E0] rounded-full px-4 py-1.5 bg-white/70 backdrop-blur-sm">
                {activeHero?.subtitle || "New Collection 2025"}
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#141413] leading-[0.92] tracking-tight">
              {activeHero?.title || settings?.hero_title || "Redefine"}{" "}
              <span className="block mt-2">
                Your{" "}
                <span className="relative inline-block">
                  Style
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#141413] rounded-full" />
                </span>
              </span>
            </motion.h1>

            {activeHero?.description && (
              <motion.p variants={itemVariants} className="text-base text-[#6B6B67] max-w-sm leading-relaxed">
                {activeHero.description}
              </motion.p>
            )}

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-2">
              <Link
                href={activeHero?.cta_link || settings?.hero_cta_link || "/products"}
                className="inline-flex items-center gap-2 bg-[#141413] text-[#FAFAF8] px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:opacity-85 transition-all duration-200 active:scale-[0.98]"
              >
                {activeHero?.cta_text || settings?.hero_cta_text || "Shop Now"}
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-[#E5E5E0] text-[#141413] bg-white px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:border-[#141413] hover:bg-[#141413] hover:text-[#FAFAF8] transition-all duration-200 active:scale-[0.98]"
              >
                Explore Collection
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-6">
              {[
                { num: "50K+", label: "Happy Customers" },
                { num: "4.9", label: "Average Rating" },
                { num: "200+", label: "Premium Brands" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[#141413]">{stat.num}</p>
                  <p className="text-[10px] text-[#6B6B67] uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual — clean geometric */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex justify-center items-center"
          >
            <div className="relative w-full max-w-[420px] aspect-[3/4]">
              {/* Background shapes */}
              <div className="absolute inset-0 rounded-[28px] bg-[#E5E5E0]/50" />
              <div className="absolute top-6 right-6 bottom-6 left-6 rounded-[22px] bg-[#F4F4F1] border border-[#E5E5E0] flex items-center justify-center overflow-hidden">
                <div className="w-40 h-40 rounded-full border-2 border-[#E5E5E0] flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-[#E5E5E0] flex items-center justify-center">
                    <span className="text-6xl font-light text-[#D4D4CC] font-bold">H</span>
                  </div>
                </div>
              </div>
              {/* Floating badge top-right */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 bg-white border border-[#E5E5E0] rounded-[14px] px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <p className="text-[10px] text-[#6B6B67] mb-0.5">Featured</p>
                <p className="text-[13px] font-semibold text-[#141413]">Leather Jacket</p>
              </motion.div>
              {/* Floating rating bottom-left */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -left-3 bg-white border border-[#E5E5E0] rounded-[14px] px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" strokeWidth={0} />
                  <span className="text-[13px] font-semibold text-[#141413]">4.9</span>
                  <span className="text-[10px] text-[#6B6B67] ml-0.5">(2.4k)</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#A8A89E]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[22px] h-[34px] border border-[#D4D4CC] rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-[3px] h-[10px] bg-[#A8A89E] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// FEATURED CATEGORIES
function CategoriesSection({ categories, loading }: { categories: Category[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="py-24 bg-secondary/30">
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
    <section className="py-20 lg:py-28 bg-[#F4F4F1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12 lg:mb-16">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B67]">Browse By</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] mt-3">Featured Categories</h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {categories.slice(0, 4).map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <AnimatedSection key={category.id} delay={index * 0.1}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group relative bg-white border border-[#E5E5E0] rounded-[16px] p-5 lg:p-7 overflow-hidden transition-all duration-400 hover:border-[#D4D4CC] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-[#F4F4F1] border border-[#E5E5E0] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[#6B6B67]" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#141413] mb-1">{category.name}</h3>
                  <p className="text-[12px] text-[#6B6B67]">{category.product_count || 0} items</p>
                  <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-[#F4F4F1] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B6B67]" strokeWidth={1.8} />
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
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 lg:mb-14">
            <div>
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 lg:h-80 rounded-[16px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B67]">Hot Right Now</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] mt-3">Trending Now</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-[#6B6B67] hover:text-[#141413] transition-colors group"
          >
            <span className="text-[13px] font-medium">View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.8} />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {products.slice(0, 6).map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.08}>
              <ProductCard product={product} />
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-10 text-center sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 text-[#6B6B67] hover:text-[#141413] transition-colors text-sm font-medium">
            View All Products
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

// PROMO BANNER
function PromoBanner({ banners, loading }: { banners: Banner[]; loading: boolean }) {
  const activeBanners = banners.filter((b) => b.is_active);
  const activeBanner = activeBanners[0];

  if (loading) {
    return (
      <section className="py-20 bg-[#F4F4F1] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <Skeleton className="h-56 lg:h-72 rounded-[20px]" />
        </div>
      </section>
    );
  }

  if (!activeBanner) return null;

  const hasBgImage = !!activeBanner.background_image;

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={hasBgImage
        ? { backgroundImage: `url(${activeBanner.background_image})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor: activeBanner.background_color || "#141413" }
      }
    >
      {!hasBgImage && <div className="absolute inset-0 bg-black/30" />}

      <AnimatedSection className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="relative border border-white/10 rounded-[20px] p-10 lg:p-16 overflow-hidden"
          style={hasBgImage
            ? { background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }
            : {}
          }
        >
          <div className="absolute top-0 right-0 w-64 h-64 border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl">
            {activeBanner.subtitle && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-[11px] uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-4 py-1.5 mb-6"
              >
                {activeBanner.subtitle}
              </motion.span>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            >
              {activeBanner.title}
            </motion.h2>

            {activeBanner.description && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base text-white/60 mb-8 max-w-sm"
              >
                {activeBanner.description}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href={activeBanner.cta_link || "/products"}
                className="inline-flex items-center gap-2 bg-white text-[#141413] px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                {activeBanner.cta_text || "Shop Now"}
                <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
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
      <section className="py-20 lg:py-28 bg-[#F4F4F1]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 lg:mb-14">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-8 w-36" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 lg:h-80 rounded-[16px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-[#F4F4F1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B67]">Just Dropped</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] mt-3">New Arrivals</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-[#6B6B67] hover:text-[#141413] transition-colors group"
          >
            <span className="text-[13px] font-medium">View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.8} />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {products.slice(0, 4).map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.1}>
              <ProductCard product={product} />
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
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <Skeleton className="h-3 w-20 mx-auto mb-3" />
            <Skeleton className="h-8 w-52 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-[16px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12 lg:mb-16">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B67]">Reviews</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] mt-3">What Our Customers Say</h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} delay={index * 0.15}>
              <div className="relative bg-[#FAFAF8] border border-[#E5E5E0] rounded-[16px] p-7 lg:p-8 h-full hover:border-[#D4D4CC] transition-colors">
                <Quote className="w-8 h-8 text-[#D4D4CC] mb-5" strokeWidth={1.5} />

                <div className="flex items-center gap-0.5 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" strokeWidth={0} />
                  ))}
                </div>

                <p className="text-[#6B6B67] leading-relaxed mb-8 text-[13px] lg:text-[14px]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F4F4F1] border border-[#E5E5E0] flex items-center justify-center overflow-hidden">
                    {testimonial.avatar ? (
                      <Image src={testimonial.avatar} alt={testimonial.name} width={36} height={36} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[13px] font-bold text-[#6B6B67]">
                        {testimonial.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#141413] flex items-center gap-1.5">
                      {testimonial.name}
                      {testimonial.verified && (
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-green-500" strokeWidth={2.5} />
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#6B6B67]">Verified Customer</p>
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
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F4F4F1]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <AnimatedSection className="max-w-xl mx-auto text-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B67]">Stay Updated</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] mt-3 mb-4">
            Join the Hermes Community
          </h2>
          <p className="text-[#6B6B67] mb-10 text-sm lg:text-base leading-relaxed">
            Subscribe to receive exclusive offers, early access to new arrivals, and style inspiration delivered to your inbox.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 border border-[#E5E5E0] rounded-[10px] px-5 py-3 text-sm bg-white text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#141413] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#141413] text-[#FAFAF8] px-7 py-3 rounded-[10px] font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 px-5 py-3 rounded-[10px] text-sm font-medium"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              Welcome! Check your inbox for a special offer.
            </motion.div>
          )}

          <p className="text-[11px] text-[#A8A89E] mt-5">
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
      // Categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      // Trending products
      const { data: trendingData } = await supabase
        .from("products")
        .select("*")
        .eq("is_trending", true)
        .eq("is_active", true)
        .limit(6);

      // Featured products
      const { data: featuredData } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(4);

      // Testimonials
      const { data: testimonialsData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      // Banners via API
      let bannersData: any[] = [];
      try {
        const bannersRes = await fetch("/api/banners", { cache: "no-store" });
        if (bannersRes.ok) {
          const bannersJson = await bannersRes.json();
          bannersData = bannersJson.banners || [];
        }
      } catch { bannersData = []; }

      // Site settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      setCategories(categoriesData || []);
      setTrendingProducts((trendingData || []).map((p: any) => ({ ...p, images: p.images || [] })));
      setFeaturedProducts((featuredData || []).map((p: any) => ({ ...p, images: p.images || [] })));
      setTestimonials(testimonialsData || []);
      setBanners(bannersData);
      setSiteSettings(settingsData);
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (error) {
    return <ErrorFallback message={error} onRetry={fetchData} />;
  }

  const heroBanners = banners.filter((b) => b.background_image);

  return (
    <main className="bg-[#FAFAF8] min-h-screen">
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
