"use client";

import { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, ChevronDown, ChevronLeft, Truck, RotateCcw, Shield, Star, ShoppingCart, Zap, X, ZoomIn } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/products";

// ─── Mock Reviews ─────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: "1",
    author: "Alex Morgan",
    avatar: "https://picsum.photos/seed/alex/60/60",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely love this product! The quality exceeded my expectations. Shipping was fast and the packaging was premium. Highly recommend to anyone looking for something that truly delivers.",
  },
  {
    id: "2",
    author: "Sarah Chen",
    avatar: "https://picsum.photos/seed/sarah/60/60",
    rating: 4,
    date: "1 month ago",
    text: "Great product overall. A few minor things I'd improve but nothing deal-breaking. The design is beautiful and it works exactly as described. Good value for money.",
  },
  {
    id: "3",
    author: "Marcus Johnson",
    avatar: "https://picsum.photos/seed/marcus/60/60",
    rating: 5,
    date: "3 weeks ago",
    text: "This is my second purchase from this brand. Consistent quality every time. The attention to detail is remarkable. Customer service was also very responsive when I had questions.",
  },
];

// ─── Accordion ────────────────────────────────────────────────────────────────
function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-white group-hover:text-white/80 transition-colors">{title}</span>
        <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform duration-300", open && "rotate-180")} />
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
            <div className="pb-5 text-sm text-white/50 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={cn(sz, i < Math.floor(rating) ? "text-yellow-400" : "text-white/20")} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function ProductDetailPageContent() {
  const params = useParams();
  const productId = params.id as string;
  const product = MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0];
  const related = MOCK_PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "#ffffff");
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      size: selectedSize ?? undefined,
      color: selectedColor,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const avgRating = product.rating;

  return (
    <div className="min-h-screen bg-black">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
              />
            </motion.div>
            {/* Lightbox thumbnails */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                  className={cn(
                    "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === i ? "border-white" : "border-white/20 hover:border-white/50"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* LEFT: Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {isDiscounted && (
                <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5" />
                Click to zoom
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200",
                    selectedImage === i ? "border-white" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Link href="/products" className="hover:text-white/70 transition-colors">Products</Link>
              <span>/</span>
              <span className="text-white/60">{product.category}</span>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StarRating rating={avgRating} />
                <span className="text-sm font-medium text-white">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-white/30">·</span>
              <span className="text-sm text-white/50">{product.reviewCount} reviews</span>
              <span className="text-white/30">·</span>
              <span className="text-sm text-emerald-400 font-medium">{product.inStock ? "In Stock" : "Out of Stock"}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white">${product.price.toFixed(2)}</span>
              {isDiscounted && (
                <span className="text-lg text-white/40 line-through">${product.originalPrice!.toFixed(2)}</span>
              )}
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Color</span>
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: selectedColor }}
                    title={selectedColor}
                  />
                </div>
                <div className="flex gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all duration-200",
                        selectedColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">Size</span>
                  <button className="text-xs text-white/50 hover:text-white underline underline-offset-2 transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-4 py-2 text-sm rounded-xl border transition-all duration-200",
                        selectedSize === size
                          ? "bg-white text-black border-white font-semibold"
                          : "bg-transparent text-white/70 border-white/10 hover:border-white/30"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-widest block mb-3">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={cn(
                  "flex-1 py-4 rounded-full font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-black hover:bg-white/90 active:scale-[0.98]"
                )}
              >
                {addedToCart ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
              <button className="flex-1 py-4 rounded-full font-semibold text-sm border border-white/20 text-white hover:bg-white/5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0",
                  inWishlist
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/30"
                )}
                style={inWishlist ? { backgroundColor: "#ef4444", borderColor: "#ef4444" } : {}}
              >
                <Heart className={cn("w-5 h-5", inWishlist ? "fill-current" : "")} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, text: "Free Shipping" },
                { icon: RotateCcw, text: "30-Day Returns" },
                { icon: Shield, text: "2-Year Warranty" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 py-3 bg-white/3 rounded-xl border border-white/5">
                  <Icon className="w-4 h-4 text-white/50" />
                  <span className="text-[10px] text-white/50 uppercase tracking-wider text-center leading-tight">{text}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="pt-2">
              <AccordionItem title="Description" defaultOpen={true}>
                {product.description}
              </AccordionItem>
              <AccordionItem title="Shipping Info">
                <p>Free standard shipping on all orders over $50. Standard shipping takes 3-5 business days. Express shipping (1-2 business days) available at checkout for $12.99.</p>
                <p className="mt-2">All orders are processed within 24 hours. You&apos;ll receive a tracking number via email once your order ships.</p>
              </AccordionItem>
              <AccordionItem title="Returns">
                <p>We offer a 30-day return policy for all unused items in original packaging. To initiate a return, please visit your dashboard or contact our support team.</p>
                <p className="mt-2">Refunds are processed within 5-7 business days after we receive your return. Return shipping is free for defective items.</p>
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-white/5 pt-12 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-white/40 text-sm">({product.reviewCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_REVIEWS.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5">
                    <Image src={review.avatar} alt={review.author} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{review.author}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-white/30">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* You May Also Like */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    image={item.image}
                    rating={item.rating}
                    reviewCount={item.reviewCount}
                    category={item.category}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page with Suspense Boundary ─────────────────────────────────────────
export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading product...</p>
        </div>
      </div>
    }>
      <ProductDetailPageContent />
    </Suspense>
  );
}
