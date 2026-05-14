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

  // ─── Auth init ─────────────────────────────────────────────
  useEffect(() => {
    let subscription: import("@supabase/supabase-js").Subscription | null = null;

    async function init() {
      const { createClient: mk } = await import("@/utils/supabase/client");
      const supabase = mk();
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (u) {
        setUser(u);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", u.id)
          .single();
        setProfile(profileData || { email: u.email ?? "" });
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);

      // @ts-expect-error Proxy loses generic inference; typing is correct at runtime
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        const s = session as { user?: { id: string; email?: string } } | null;
        if (s?.user) {
          const userEmail = s.user.email ?? "";
          setUser(s.user as { id: string; email?: string });
          supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", s.user.id)
            .single()
            .then(({ data }: { data: { full_name?: string; role?: string } | null }) => setProfile(data || { email: userEmail }));
        } else {
          setUser(null);
          setProfile(null);
        }
      }).data.subscription;
    }

    init();
    return () => { subscription?.unsubscribe(); };
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

  // Scroll handler
  useEffect(() => {
    function handleScroll() { setIsScrolled(window.scrollY > 20); }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart drawer toggle
  useEffect(() => {
    const handler = () => setIsCartOpen((prev) => !prev);
    window.addEventListener(CART_DRAWER_TOGGLE, handler);
    return () => window.removeEventListener(CART_DRAWER_TOGGLE, handler);
  }, []);

  // Mobile resize
  useEffect(() => {
    function handleResize() { if (window.innerWidth >= 768) setIsMobileMenuOpen(false); }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll on mobile menu
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  async function handleSignOut() {
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
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <>
      {/* ─── Topbar ribbon ───────────────────────────────────── */}
      <div className="bg-foreground text-background h-8 flex items-center justify-center text-[11px] font-medium tracking-wide">
        <span>Free shipping on orders over $150</span>
        <span className="mx-3 opacity-40">·</span>
        <span>New arrivals every Friday</span>
      </div>

      {/* ─── Main navbar ──────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "shadow-sm backdrop-blur-xl bg-background/80"
            : "bg-background/60"
        )}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-bold text-lg tracking-[0.25em] text-foreground">
              HERMES
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              onClick={() => router.push("/products")}
              className="p-2.5 rounded-full hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span key="moon" initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 20 }} transition={{ duration: 0.15 }}>
                    <Moon className="w-[18px] h-[18px]" />
                  </motion.span>
                ) : (
                  <motion.span key="sun" initial={{ opacity: 0, rotate: 20 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -20 }} transition={{ duration: 0.15 }}>
                    <Sun className="w-[18px] h-[18px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-foreground text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-foreground text-background"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User dropdown */}
            {!authLoading && user ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen((p) => !p)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-muted transition-colors duration-200"
                  aria-label="User menu"
                >
                  {profile?.full_name ? (
                    <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-[11px] font-bold">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-[18px] h-[18px] text-muted-foreground" />
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border border-border bg-card overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-card-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                      </div>
                      <div className="p-1.5">
                        {[
                          { icon: User, label: "Profile", href: "/profile" },
                          { icon: Package, label: "Orders", href: "/orders" },
                          { icon: Settings, label: "Settings", href: "/settings" },
                          ...((profile?.role === "admin" || profile?.role === "super_admin")
                            ? [{ icon: LayoutDashboard, label: "Admin Panel", href: "/admin" }]
                            : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={label}
                            href={href}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </Link>
                        ))}
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full disabled:opacity-50"
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
              <Link
                href="/login"
                className="ml-1 px-4 py-1.5 rounded-full text-sm font-medium border border-border text-foreground hover:bg-foreground hover:text-background transition-all duration-200"
              >
                Login
              </Link>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-full hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground ml-1"
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile fullscreen menu ──────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex flex-col bg-background"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-lg tracking-[0.25em] text-foreground">
                HERMES
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); toggleTheme(); }}
                  className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
                </button>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="px-6 pt-5 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-border rounded-full py-2.5 pl-11 pr-4 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </form>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-4 text-xl font-light border-b border-border text-foreground hover:text-muted-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {!authLoading && user && (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-6 mb-2 font-semibold">Account</p>
                  {[
                    { label: "Profile", href: "/profile" },
                    { label: "Orders", href: "/orders" },
                    { label: "Settings", href: "/settings" },
                    ...((profile?.role === "admin" || profile?.role === "super_admin")
                      ? [{ label: "Admin Panel", href: "/admin" }]
                      : []),
                  ].map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-4 text-lg font-light border-b border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="px-6 pb-8 pt-4 border-t border-border shrink-0 space-y-3">
              {!authLoading && user ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  <button onClick={handleSignOut} disabled={signingOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-red-500/30 text-red-400 font-medium text-sm hover:border-red-500/60 transition-colors disabled:opacity-50">
                    <LogOut className="w-4 h-4" />
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : !authLoading ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity">
                    <User className="w-4 h-4" />
                    Login / Sign Up
                  </Link>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
