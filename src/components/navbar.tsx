"use client";

import { useState, useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  Sun,
  Moon,
  ShoppingBag,
  ArrowRight,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useThemeStore, toggleTheme } from "@/store/theme-store";
import { CartDrawer } from "./cart-drawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Track Order", href: "/orders" },
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const CART_DRAWER_TOGGLE = "hermes:cart:toggle";

export function toggleCartDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_DRAWER_TOGGLE));
  }
}

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auth state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; role?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const theme = useThemeStore((s) => s.theme);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.wishlistItems);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isDark = theme === "dark";

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseRef = useRef<SupabaseClient | null>(null);
  useEffect(() => {
    let subscription: import("@supabase/supabase-js").Subscription | null = null;

    async function init() {
      const { createClient: mk } = await import("@/utils/supabase/client");
      supabaseRef.current = mk();
      const supabase = supabaseRef.current;

      const { data: { user: u } } = await supabase.auth.getUser();

      if (u) {
        setUser(u);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", u.id)
          .single();
        setProfile(profileData || { email: u.email });
      }
      setAuthLoading(false);

      // Listen for auth changes
      subscription = supabase.auth.onAuthStateChange((_event: string, session) => {
        if (session?.user) {
          setUser(session.user);
          supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) => setProfile(data || { email: session.user.email }));
        } else {
          setUser(null);
          setProfile(null);
        }
      }).data.subscription;
    }

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for cart drawer toggle
  useEffect(() => {
    const handler = () => setIsCartOpen((prev) => !prev);
    window.addEventListener(CART_DRAWER_TOGGLE, handler);
    return () => window.removeEventListener(CART_DRAWER_TOGGLE, handler);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setSigningOut(true);
    setIsUserDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setProfile(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[var(--bg)]/90 dark:bg-black/90 backdrop-blur-md shadow-[0_1px_0_var(--border)] dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]"
            : "bg-[var(--bg)]/80 dark:bg-black/80"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-xl tracking-[0.2em] shrink-0 text-[var(--text)] dark:text-white transition-colors"
          >
            HERMES
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full border rounded-full py-2 pl-10 pr-4 text-sm placeholder:transition-colors focus:outline-none transition-all",
                  "bg-[var(--glass-bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-secondary)]",
                  "focus:border-[var(--text-secondary)] dark:focus:border-white/30",
                  "dark:bg-white/5 dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:bg-white/10"
                )}
              />
            </div>
          </form>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-[var(--accent)] text-[var(--bg)]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-[var(--accent)] text-[var(--bg)]"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User — Logged In */}
            {!authLoading && user ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
                  aria-label="User menu"
                >
                  {profile?.full_name ? (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center text-xs font-bold">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl overflow-hidden border bg-[var(--bg-card)] border-[var(--border)]"
                    >
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{displayName}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{displayEmail}</p>
                      </div>
                      <div className="p-1">
                        {[
                          { icon: User, label: "Profile", href: "/profile" },
                          { icon: Package, label: "Orders", href: "/orders" },
                          { icon: Settings, label: "Settings", href: "/settings" },
                          ...(profile?.role === "admin" || profile?.role === "super_admin"
                            ? [{ icon: LayoutDashboard, label: "Admin Panel", href: "/admin" }]
                            : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--glass-bg)] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {signingOut ? "Signing out..." : "Sign Out"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : !authLoading ? (
              /* User — Logged Out */
              <Link
                href="/login"
                className="ml-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all border border-[var(--text-secondary)] dark:border-white/30 text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:border-[var(--text)] dark:hover:border-white"
              >
                Login
              </Link>
            ) : null}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors relative group text-[var(--text-secondary)] dark:text-white/70 hover:text-[var(--text)] dark:hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-[var(--text-secondary)] dark:bg-white" />
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col backdrop-blur-xl bg-[var(--bg)] dark:bg-black/95"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)] dark:border-white/10">
              <Link
                href="/"
                className="font-bold text-xl tracking-[0.2em] text-[var(--text)] dark:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HERMES
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full transition-all text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white hover:bg-[var(--glass-bg)] dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-6 py-4 border-b border-[var(--border)] dark:border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full border rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:transition-colors focus:outline-none transition-all",
                    "bg-[var(--glass-bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-secondary)]",
                    "dark:bg-white/5 dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-white/30"
                  )}
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-6 py-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-4 text-2xl font-light border-b text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white border-[var(--border)] dark:border-white/5"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Auth Links */}
                {!authLoading && user && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="pt-4 pb-2">
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Account</p>
                      </div>
                    </motion.div>
                    {[
                      { label: "Profile", href: "/profile" },
                      { label: "Orders", href: "/orders" },
                      { label: "Settings", href: "/settings" },
                    ].map((link, i) => (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-4 text-xl font-light border-b text-[var(--text-secondary)] dark:text-white/80 hover:text-[var(--text)] dark:hover:text-white border-[var(--border)] dark:border-white/5"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}
              </motion.div>
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="px-6 py-6 border-t border-[var(--border)] dark:border-white/10">
              {!authLoading && user ? (
                <>
                  {/* Logged in: theme toggle, wishlist, sign out */}
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); toggleTheme(); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-all",
                        "text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-secondary)]",
                        "dark:text-white/80 dark:border-white/20 dark:hover:text-white dark:hover:border-white/40"
                      )}
                    >
                      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span className="text-sm font-medium">{isDark ? "Dark Mode" : "Light Mode"}</span>
                    </button>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-all",
                        "text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-secondary)]",
                        "dark:text-white/80 dark:border-white/20 dark:hover:text-white dark:hover:border-white/40"
                      )}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                    </Link>
                  </div>

                  {/* Cart */}
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-medium text-sm transition-all bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </button>
                  </div>

                  {/* Sign out */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-red-500/30 text-red-400 font-medium text-sm hover:border-red-500/60 hover:text-red-300 transition-all disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : !authLoading ? (
                <>
                  {/* Logged out: login link, theme, wishlist */}
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); toggleTheme(); }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-all",
                        "text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-secondary)]",
                        "dark:text-white/80 dark:border-white/20 dark:hover:text-white dark:hover:border-white/40"
                      )}
                    >
                      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span className="text-sm font-medium">{isDark ? "Dark Mode" : "Light Mode"}</span>
                    </button>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-all",
                        "text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--text-secondary)]",
                        "dark:text-white/80 dark:border-white/20 dark:hover:text-white dark:hover:border-white/40"
                      )}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                    </Link>
                  </div>

                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-medium text-sm transition-all bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
                  >
                    <User className="w-4 h-4" />
                    Login / Sign Up
                  </Link>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}