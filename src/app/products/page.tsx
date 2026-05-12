"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, SlidersHorizontal, Star } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

// Types
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
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Filter and sort types
type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

// Skeleton loader
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white/5 rounded-2xl overflow-hidden">
        <div className="aspect-square bg-white/5" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
          <div className="h-4 bg-white/5 rounded w-1/3 mt-4" />
        </div>
      </div>
    </div>
  );
}

// Filter Sidebar Component
function FilterSidebar({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
  selectedRating,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onReset,
  isOpen,
  onClose,
}: {
  categories: Category[];
  selectedCategories: string[];
  minPrice: string;
  maxPrice: string;
  selectedRating: number | null;
  onCategoryChange: (category: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onRatingChange: (rating: number | null) => void;
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-80 bg-zinc-950 border-r border-white/5 transform transition-transform duration-300 lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full overflow-y-auto p-6 lg:p-0 lg:pr-6">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Filters</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => onCategoryChange(cat.slug)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center peer-checked:bg-white peer-checked:border-white transition-colors">
                        <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Price Range</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <span className="text-white/30">—</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => onPriceChange(minPrice, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => onRatingChange(selectedRating === rating ? null : rating)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center peer-checked:bg-white peer-checked:border-white transition-colors">
                        <div className="w-2 h-2 bg-black rounded-full opacity-0 peer-checked:opacity-100" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("w-3 h-3", i < rating ? "text-yellow-400 fill-yellow-400" : "text-white/20")}
                        />
                      ))}
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors ml-1">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className="w-full text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              Reset all filters
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Main Page Component
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");

        // Fetch products
        const { data: productsData } = await supabase
          .from("products")
          .select("*, categories(name, slug)")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        const transformedProducts = (productsData || []).map((p: any) => ({
          ...p,
          images: p.images || [],
          category: p.categories?.name,
          category_id: p.categories?.id,
        }));

        setCategories(categoriesData || []);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter handlers
  const handleCategoryChange = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(null);
    setSortBy("newest");
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const catSlug = (p as any).categories?.slug;
        return selectedCategories.includes(catSlug);
      });
    }

    // Price filter
    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Rating filter
    if (selectedRating) {
      result = result.filter((p) => (p.rating || 0) >= selectedRating);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        // Already sorted by created_at desc from Supabase
        break;
    }

    return result;
  }, [products, selectedCategories, minPrice, maxPrice, selectedRating, sortBy]);

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-white/5">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">All Products</h1>
          <p className="text-white/50">
            {loading ? "Loading..." : `${filteredProducts.length} products found`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
            selectedRating={selectedRating}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            onReset={handleReset}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(selectedCategories.length > 0 || minPrice || maxPrice || selectedRating) && (
                  <span className="w-5 h-5 bg-white text-black rounded-full text-xs flex items-center justify-center">
                    {selectedCategories.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (selectedRating ? 1 : 0)}
                  </span>
                )}
              </button>

              <div className="hidden lg:block text-sm text-white/50">
                Showing {filteredProducts.length} products
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-full px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-zinc-950">
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return (
                    <button
                      key={slug}
                      onClick={() => handleCategoryChange(slug)}
                      className="flex items-center gap-1 bg-white/10 text-sm text-white px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                      {cat?.name || slug}
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/50 mb-4">No products found matching your criteria.</p>
                <button
                  onClick={handleReset}
                  className="text-white underline underline-offset-2 hover:text-white/70 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
