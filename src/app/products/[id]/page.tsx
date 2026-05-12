"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ChevronDown,
  ChevronLeft,
  Truck,
  RotateCcw,
  Shield,
  ShoppingCart,
  Zap,
  X,
  ZoomIn,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

// Types
interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes?: Record<string, string>;
}

interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  author?: { id: string; full_name: string; avatar_url?: string };
}

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
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string };
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
}

// Accordion Component
function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--text-secondary)] transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--text-secondary)] transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Star Rating Component
function StarRating({
  rating,
  size = "sm",
  showCount = false,
  count = 0,
}: {
  rating: number;
  size?: "sm" | "md";
  showCount?: boolean;
  count?: number;
}) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(sz, i < Math.floor(rating) ? "text-yellow-400" : "text-white/20")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showCount && (
        <span className="text-xs text-[var(--text-secondary)] ml-1">({count})</span>
      )}
    </div>
  );
}

// Lightbox Component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <ChevronLeft className="w-10 h-10" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 text-white/60 hover:text-white transition-colors z-10"
      >
        <ChevronDown className="w-10 h-10 rotate-90" />
      </button>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-4xl max-h-[80vh] mx-4"
      >
        <Image
          src={images[currentIndex]}
          alt="Product"
          width={800}
          height={800}
          className="max-h-[80vh] w-auto object-contain"
          priority
        />
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i === currentIndex ? "bg-white" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Main Page Component
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Build gallery images
  const galleryImages = (() => {
    if (!product) return [];
    const images: string[] = [];
    if (product.primary_image) images.push(product.primary_image);
    if (product.images) {
      product.images.forEach((img) => {
        if (img.url && !images.includes(img.url)) images.push(img.url);
      });
    }
    return images.length > 0 ? images : ["https://picsum.photos/800"];
  })();

  // Extract color/size options from variants
  const colorOptions = (() => {
    if (!product?.variants) return [];
    const colors = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes?.color) colors.add(v.attributes.color);
    });
    return Array.from(colors);
  })();

  const sizeOptions = (() => {
    if (!product?.variants) return [];
    const sizes = new Set<string>();
    product.variants.forEach((v) => {
      if (v.attributes?.size) sizes.add(v.attributes.size);
    });
    return Array.from(sizes);
  })();

  // Fetch product data from API route
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load product");
          return;
        }

        setProduct(data.product);

        // Try fetching related products from same category
        const categorySlug = data.product.category?.slug;
        if (categorySlug) {
          try {
            const relatedRes = await fetch(
              `/api/products?category_slug=${categorySlug}&limit=4`
            );
            const relatedData = await relatedRes.json();
            const related = (relatedData.products || []).filter(
              (p: Product) => p.id !== productId
            );
            setRelatedProducts(related);
          } catch {
            // Silently fail for related products
          }
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    const price = selectedVariant?.price ?? product.price;
    const variantName = selectedVariant
      ? [selectedVariant.attributes?.color, selectedVariant.attributes?.size]
          .filter(Boolean)
          .join(" / ")
      : undefined;

    addItem({
      id: selectedVariant?.id || product.id,
      name: product.name,
      price,
      image: product.primary_image || "https://picsum.photos/400",
      quantity,
      color: selectedVariant?.attributes?.color,
      size: selectedVariant?.attributes?.size,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    // In a real app, redirect to checkout
  };

  // Image navigation
  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="aspect-square bg-white/5 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="h-4 bg-white/5 rounded w-24" />
              <div className="h-12 bg-white/5 rounded w-3/4" />
              <div className="h-6 bg-white/5 rounded w-1/4" />
              <div className="h-32 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">{error || "Product not found"}</p>
          <Link
            href="/products"
            className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - currentPrice) / product.compare_at_price) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={galleryImages}
            currentIndex={selectedImage}
            onClose={() => setLightboxOpen(false)}
            onNext={handleNextImage}
            onPrev={handlePrevImage}
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-8">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">
            Home
          </Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-[var(--text)] transition-colors">
            Products
          </Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-[var(--text)]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              className="relative aspect-square bg-[var(--bg-card)] rounded-2xl overflow-hidden cursor-zoom-in border border-[var(--border)]"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={galleryImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-[var(--accent)] text-[var(--bg)] text-xs font-bold px-3 py-1.5 rounded-full">
                  -{discount}%
                </div>
              )}
              <button className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors">
                <ZoomIn className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all",
                      selectedImage === index
                        ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
              {product.category && (
                <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                  {product.category.name}
                </p>
              )}
              {product.category && product.brand && (
                <span className="text-[var(--border)]">·</span>
              )}
              {product.brand && (
                <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                  {product.brand.name}
                </p>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avg_rating && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.avg_rating} size="md" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {product.avg_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-[var(--text)]">
                ${currentPrice.toFixed(2)}
              </span>
              {product.compare_at_price && product.compare_at_price > currentPrice && (
                <span className="text-xl text-[var(--text-secondary)] line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Color Selector */}
            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Color:{" "}
                  <span className="text-[var(--text)]">
                    {selectedVariant?.attributes?.color || "Select a color"}
                  </span>
                </p>
                <div className="flex gap-3">
                  {colorOptions.map((color) => {
                    const matchingVariant = product.variants?.find(
                      (v) => v.attributes?.color === color
                    );
                    const isSelected = selectedVariant?.attributes?.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          if (selectedVariant?.attributes?.size) {
                            const newVariant = product.variants?.find(
                              (v) =>
                                v.attributes?.color === color &&
                                v.attributes?.size === selectedVariant.attributes?.size
                            );
                            setSelectedVariant(newVariant || null);
                          } else {
                            setSelectedVariant(matchingVariant || null);
                          }
                        }}
                        className={cn(
                          "min-w-[48px] px-4 py-2.5 rounded-xl border transition-all text-sm font-medium",
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                            : "bg-transparent text-[var(--text)] border-[var(--border)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizeOptions.length > 0 && (
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Size:{" "}
                  <span className="text-[var(--text)]">
                    {selectedVariant?.attributes?.size || "Select a size"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size) => {
                    const matchingVariant = product.variants?.find(
                      (v) => v.attributes?.size === size
                    );
                    const isSelected = selectedVariant?.attributes?.size === size;
                    const outOfStock =
                      matchingVariant && matchingVariant.stock_quantity <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (selectedVariant?.attributes?.color) {
                            const newVariant = product.variants?.find(
                              (v) =>
                                v.attributes?.size === size &&
                                v.attributes?.color === selectedVariant.attributes?.color
                            );
                            setSelectedVariant(newVariant || null);
                          } else {
                            setSelectedVariant(matchingVariant || null);
                          }
                        }}
                        disabled={outOfStock}
                        className={cn(
                          "min-w-[48px] px-4 py-2.5 rounded-xl border transition-all text-sm font-medium",
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                            : outOfStock
                            ? "bg-transparent text-[var(--text-secondary)] border-[var(--border)] opacity-40 cursor-not-allowed"
                            : "bg-transparent text-[var(--text)] border-[var(--border)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 border border-[var(--border)] rounded-xl">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-[var(--text)] font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock_quantity !== undefined && product.stock_quantity <= 10 && (
                  <p className="text-sm text-amber-400">
                    Only {product.stock_quantity} left!
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-all",
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : "bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90"
                )}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center border transition-all",
                  inWishlist
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-transparent border-[var(--border)] text-[var(--text)] hover:border-[var(--text-secondary)]"
                )}
                style={inWishlist ? { backgroundColor: "#ef4444", borderColor: "#ef4444" } : {}}
              >
                <Heart className={cn("w-5 h-5", inWishlist ? "fill-current" : "")} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 rounded-full font-semibold bg-white/10 border border-[var(--border)] text-[var(--text)] hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Buy Now
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border)]">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-xs text-[var(--text-secondary)]">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-xs text-[var(--text-secondary)]">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-xs text-[var(--text-secondary)]">Secure Payment</p>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-white/5">
              <AccordionItem title="Description" defaultOpen>
                {product.description ||
                  "Experience premium quality with this carefully crafted product. Made with the finest materials and attention to detail, it's designed to elevate your lifestyle."}
              </AccordionItem>

              <AccordionItem title="Shipping & Returns">
                Free standard shipping on all orders. Express shipping available at checkout. Returns accepted within 30 days of delivery. Items must be unused and in original packaging.
              </AccordionItem>

              <AccordionItem title="Care Instructions">
                Follow the care label instructions. For best results, hand wash or dry clean. Store in a cool, dry place away from direct sunlight.
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/5">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-8">
              Customer Reviews ({product.reviews.length})
            </h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center overflow-hidden">
                        {review.author?.avatar_url ? (
                          <Image
                            src={review.author.avatar_url}
                            alt={review.author.full_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-[var(--text)]">
                            {(review.author?.full_name || "User")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">
                          {review.author?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/5">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  price={relatedProduct.price}
                  originalPrice={relatedProduct.compare_at_price}
                  image={relatedProduct.primary_image || "https://picsum.photos/400"}
                  rating={relatedProduct.avg_rating}
                  category={relatedProduct.category?.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
