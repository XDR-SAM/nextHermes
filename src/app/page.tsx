"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shirt, Gem, Watch, Smartphone, Star, ArrowRight, Check, Quote } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

// =====================
// MOCK DATA
// =====================

const trendingProducts = [
  { id: "1", name: "Premium Leather Jacket", price: 299, originalPrice: 449, image: "https://picsum.photos/seed/prod1/400/400", rating: 4.8, reviewCount: 124, category: "Men" },
  { id: "2", name: "Minimalist Watch Pro", price: 189, originalPrice: 249, image: "https://picsum.photos/seed/prod2/400/400", rating: 4.9, reviewCount: 89, category: "Accessories" },
  { id: "3", name: "Cashmere Blend Sweater", price: 159, originalPrice: 219, image: "https://picsum.photos/seed/prod3/400/400", rating: 4.7, reviewCount: 56, category: "Women" },
  { id: "4", name: "Wireless Earbuds Elite", price: 199, originalPrice: 279, image: "https://picsum.photos/seed/prod4/400/400", rating: 4.6, reviewCount: 203, category: "Electronics" },
  { id: "5", name: "Designer Sunglasses", price: 129, originalPrice: 179, image: "https://picsum.photos/seed/prod5/400/400", rating: 4.5, reviewCount: 67, category: "Accessories" },
  { id: "6", name: "Smart Fitness Band", price: 99, originalPrice: 149, image: "https://picsum.photos/seed/prod6/400/400", rating: 4.4, reviewCount: 312, category: "Electronics" },
];

const newArrivals = [
  { id: "7", name: "Organic Cotton Tee", price: 59, image: "https://picsum.photos/seed/new1/400/400", rating: 4.3, reviewCount: 12, category: "Men" },
  { id: "8", name: "Silk Scarf Collection", price: 89, image: "https://picsum.photos/seed/new2/400/400", rating: 4.6, reviewCount: 8, category: "Women" },
  { id: "9", name: "Titanium Ring Set", price: 149, image: "https://picsum.photos/seed/new3/400/400", rating: 4.8, reviewCount: 15, category: "Accessories" },
  { id: "10", name: "Portable Charger 20K", price: 79, image: "https://picsum.photos/seed/new4/400/400", rating: 4.5, reviewCount: 28, category: "Electronics" },
];

const categories = [
  { name: "Men", count: 342, icon: Shirt },
  { name: "Women", count: 456, icon: Gem },
  { name: "Accessories", count: 218, icon: Watch },
  { name: "Electronics", count: 167, icon: Smartphone },
];

const testimonials = [
  { name: "Alexandra Chen", quote: "The quality exceeded my expectations. Every piece I've purchased feels luxury, yet remains practical for everyday wear.", rating: 5, verified: true },
  { name: "Marcus Thompson", quote: "Fast shipping, impeccable packaging, and the products themselves are stunning. Hermes has become my go-to for premium fashion.", rating: 5, verified: true },
  { name: "Sofia Rodriguez", quote: "I've recommended Hermes to everyone I know. The attention to detail is remarkable, and customer service is exceptional.", rating: 5, verified: true },
];

// =====================
// ANIMATED SECTION WRAPPER
// =====================

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

// =====================
// SECTION 1: HERO
// =====================

function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/3 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/50 border border-white/20 rounded-full px-4 py-1.5">
                New Collection 2025
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.9] tracking-tight">
              Redefine{" "}
              <span className="block mt-2">
                Your{" "}
                <span className="relative">
                  Style
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-white" />
                </span>
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-white/60 max-w-md leading-relaxed">
              Discover premium products curated for the modern lifestyle. Where timeless design meets contemporary elegance.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/collection"
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

          {/* Right - Hero Image Placeholder */}
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
              {/* Floating Elements */}
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

      {/* Scroll Indicator */}
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

// =====================
// SECTION 2: FEATURED CATEGORIES
// =====================

function CategoriesSection() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Browse By</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">Featured Categories</h2>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <AnimatedSection key={category.name} delay={index * 0.1}>
              <Link
                href={`/category/${category.name.toLowerCase()}`}
                className="group relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-2xl p-6 lg:p-8 overflow-hidden transition-all duration-500 hover:border-white/15 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <category.icon className="w-6 h-6 text-white/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-white/40">{category.count} items</p>
                </div>

                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-[-4px]">
                  <ArrowRight className="w-4 h-4 text-white/70" />
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================
// SECTION 3: TRENDING PRODUCTS
// =====================

function TrendingSection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Hot Right Now</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">Trending Now</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {trendingProducts.map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.08}>
              <ProductCard {...product} />
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-10 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

// =====================
// SECTION 4: PROMO BANNER
// =====================

function PromoBanner() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/3 rounded-full blur-[150px]" />
      </div>

      <AnimatedSection className="container mx-auto px-6 relative z-10">
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-3xl p-8 lg:p-16 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 border border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs uppercase tracking-[0.3em] text-white/50 border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              Limited Time Offer
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
            >
              SUMMER
              <br />
              <span className="text-white/80">SALE</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                40%
              </span>
              <p className="text-lg text-white/50 mt-2">Off on all premium items</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/sale"
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

// =====================
// SECTION 5: NEW ARRIVALS
// =====================

function NewArrivalsSection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Just Dropped</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">New Arrivals</h2>
          </div>
          <Link
            href="/new"
            className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.1}>
              <ProductCard {...product} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================
// SECTION 6: TESTIMONIALS
// =====================

function TestimonialsSection() {
  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Reviews</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">What Our Customers Say</h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.name} delay={index * 0.15}>
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-2xl p-8 h-full hover:border-white/10 transition-colors">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-white/10 mb-6" />

                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/70 leading-relaxed mb-8 text-sm lg:text-base">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {testimonial.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      {testimonial.name}
                      {testimonial.verified && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40">Verified Customer</p>
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

// =====================
// SECTION 7: NEWSLETTER
// =====================

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-6">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">Stay Updated</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Join the Hermes Community
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto">
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
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
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

          <p className="text-xs text-white/30 mt-6">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// =====================
// MAIN PAGE
// =====================

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <TrendingSection />
      <PromoBanner />
      <NewArrivalsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
