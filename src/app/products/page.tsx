"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, SlidersHorizontal, Search, ChevronDown, Package } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

// ─── Types (match actual DB columns) ─────────────────────────────────────────
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

interface Category {
  id: string;
  name: string;
  slug: string;
  product_count?: number;
}

type SortOption = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const ITEMS_PER_PAGE = 12;

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="aspect-square bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onReset,
  isOpen,
  onClose,
}: {
  categories: Category[];
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (id: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-background border-r border-border",
          "transform transition-transform duration-300 lg:transform-none overflow-y-auto",
          "lg:block lg:static lg:h-auto lg:w-64 lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 space-y-6">
          {/* Mobile close */}
          <div className="flex items-center justify-between lg:hidden">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Categories
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer group py-1",
                    selectedCategories.includes(cat.id) ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => onCategoryChange(cat.id)}
                  />
                  <div
                    className={cn(
                      "w-5 h-5 border rounded flex items-center justify-center transition-colors shrink-0",
                      selectedCategories.includes(cat.id)
                        ? "bg-foreground border-foreground"
                        : "border-border group-hover:border-muted-foreground"
                    )}
                  >
                    {selectedCategories.includes(cat.id) && (
                      <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm group-hover:text-foreground transition-colors">
                    {cat.name}
                    {cat.product_count !== undefined && (
                      <span className="ml-1 text-xs opacity-50">({cat.product_count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Price Range
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors bg-background text-foreground"
                />
              </div>
              <span className="text-muted-foreground">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => onPriceChange(minPrice, e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Reset all filters
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  // Build URL params
  const buildParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(ITEMS_PER_PAGE));
      params.set("offset", String((pageNum - 1) * ITEMS_PER_PAGE));
      params.set("sort", sortBy);
      if (searchQuery) params.set("search", searchQuery);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      selectedCategories.forEach((id) => params.append("category_id", id));
      return params;
    },
    [sortBy, searchQuery, minPrice, maxPrice, selectedCategories]
  );

  // Sync URL → state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("q") || params.get("search") || "";
    const sort = params.get("sort") as SortOption | null;
    const min = params.get("min_price") || "";
    const max = params.get("max_price") || "";
    const pageParam = params.get("page");
    if (search) setSearchQuery(search);
    if (sort && SORT_OPTIONS.some((o) => o.value === sort)) setSortBy(sort);
    if (min) setMinPrice(min);
    if (max) setMaxPrice(max);
    if (pageParam) setPage(parseInt(pageParam, 10) || 1);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [searchQuery, minPrice, maxPrice, sortBy, page]);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = buildParams(page);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [buildParams, page]);

  const handleCategoryChange = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-4">All Products</h1>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full border border-border rounded-full pl-12 pr-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${total} products`}
          </p>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {selectedCategories.length > 0 && (
                <span className="bg-foreground text-background text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2 border border-border rounded-lg text-sm bg-background text-foreground cursor-pointer hover:bg-muted transition-colors focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onReset={handleReset}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No products found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-muted disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-muted disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}