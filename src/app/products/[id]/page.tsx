"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  ShoppingCart,
  X,
  Package,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

// ─── Actual DB product shape ─────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  sku: string | null;
  stock_quantity: number;
  stock_status: string;
  category_id: string | null;
  brand_id: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Accordion ───────────────────────────────────────────────────────────────
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
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium group-hover:text-muted-foreground transition-colors">
          {title}
        </span>
        <ChevronRight
          className={cn("w-4 h-4 transition-transform duration-300", open && "rotate-90")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-muted-foreground leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="animate-pulse">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="flex gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = product ? isInWishlist(product.id) : false;

  // Derived values
  const isOutOfStock = product?.stock_status === "out_of_stock" || (product?.stock_quantity ?? 0) === 0;
  const isDiscounted = product?.original_price != null && (product.original_price ?? 0) > product.price;
  const discountPct = isDiscounted && product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Fetch product
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok || !data.product) {
          setError(data.error || "Product not found");
          return;
        }

        setProduct(data.product);

        // Fetch category name if available
        if (data.product.category_id) {
          try {
            const catRes = await fetch(`/api/categories`);
            const catData = await catRes.json();
            const cats = catData.categories || [];
            const match = cats.find((c: { id: string; name: string }) => c.id === data.product.category_id);
            if (match) setCategoryName(match.name);
          } catch { /* silently skip */ }
        }

        // Fetch related products (same category)
        if (data.product.category_id) {
          try {
            const relRes = await fetch(
              `/api/products?category_id=${data.product.category_id}&limit=4`
            );
            const relData = await relRes.json();
            const related = (relData.products || []).filter(
              (p: Product) => p.id !== productId
            );
            setRelatedProducts(related.slice(0, 4));
          } catch { /* silently skip */ }
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: "", quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <ProductSkeleton />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-3">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "This product doesn't exist or may have been removed."}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT: Image placeholder */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border">
              <span className="text-8xl font-bold text-foreground/8 select-none">
                {product.name.charAt(0)}
              </span>
            </div>
            {isDiscounted && (
              <div className="absolute top-4 left-4 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-full">
                -{discountPct}% OFF
              </div>
            )}
          </div>

          {/* RIGHT: Product info */}
          <div className="space-y-6">
            {/* Category */}
            {categoryName && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {categoryName}
              </p>
            )}

            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold">${product.price.toLocaleString()}</span>
              {isDiscounted && product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.original_price.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    Save ${(product.original_price - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", isOutOfStock ? "bg-red-500" : "bg-emerald-500")} />
              <span className="text-sm text-muted-foreground">
                {isOutOfStock ? "Out of Stock" : `${product.stock_quantity} in stock`}
              </span>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addedToCart}
                className={cn(
                  "flex-1 py-4 rounded-full font-semibold transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  addedToCart
                    ? "bg-emerald-500 text-white"
                    : isOutOfStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:opacity-90 active:scale-[0.98]"
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
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200",
                  inWishlist
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-border hover:border-foreground/30 hover:bg-muted"
                )}
              >
                <Heart className={cn("w-4 h-4", inWishlist ? "fill-current" : "")} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {[
                { icon: Truck, label: "Free Shipping", sub: "On orders over $100" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free" },
                { icon: Shield, label: "2-Year Warranty", sub: "Manufacturer" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description accordion */}
        <div className="mt-12 max-w-2xl">
          <div className="border border-border rounded-2xl overflow-hidden">
            <AccordionItem title="Product Description" defaultOpen>
              {product.description || "No description available."}
            </AccordionItem>
            <AccordionItem title="Shipping & Returns">
              <p><strong>Shipping:</strong> Standard delivery takes 3–5 business days. Express options available at checkout. Free shipping on orders over $100.</p>
              <p className="mt-2"><strong>Returns:</strong> Not satisfied? Return within 30 days for a full refund. Items must be in original condition.</p>
            </AccordionItem>
            <AccordionItem title="Size Guide">
              <p>This product fits true to size. If you're between sizes, we recommend sizing up for a more relaxed fit.</p>
            </AccordionItem>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}