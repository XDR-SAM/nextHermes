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
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { CartDrawer } from "./cart-drawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
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

  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.wishlistItems);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

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
    function handleResize() { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false); }
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
      {/* ─── Topbar ribbon (compact) ─── */}
      <div className="bg-[#141413] text-[#FAFAF8] h-9 flex items-center justify-center text-[11px] tracking-wide">
        <span className="hidden xs:inline">Free shipping on orders over $150</span>
        <span className="xs:hidden">Free shipping $150+</span>
        <span className="mx-3 opacity-30">·</span>
        <span>New arrivals every Friday</span>
      </div>

      {/* ─── Main navbar ─── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-200",
          isScrolled
            ? "shadow-sm bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E5E5E0]"
            : "bg-[#FAFAF8]/70"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 group">
            <span className="font-bold text-base tracking-[0.3em] text-[#141413] group-hover:opacity-70 transition-opacity duration-200">
              HERMES
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium tracking-wide text-[#6B6B67] hover:text-[#141413] transition-colors duration-200 relative after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-px after:bg-[#141413] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-0.5">

            {/* Search */}
            <button
              onClick={() => router.push("/products")}
              className="p-2.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors duration-150 text-[#6B6B67] hover:text-[#141413]"
              aria-label="Search"
            >
              <Search className="w-[19px] h-[19px]" strokeWidth={1.8} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors duration-150 text-[#6B6B67] hover:text-[#141413]"
            >
              <Heart className="w-[19px] h-[19px]" strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-[#141413] text-[#FAFAF8]">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors duration-150 text-[#6B6B67] hover:text-[#141413]"
            >
              <ShoppingCart className="w-[19px] h-[19px]" strokeWidth={1.8} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, ease: "backOut" }}
                  className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-[#141413] text-[#FAFAF8]"
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </motion.span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-[#E5E5E0] mx-1.5 hidden sm:block" />

            {/* User dropdown */}
            {!authLoading && user ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen((p) => !p)}
                  className="flex items-center gap-1.5 p-1.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors duration-150"
                  aria-label="User menu"
                >
                  {profile?.full_name ? (
                    <div className="w-7 h-7 rounded-full bg-[#141413] text-[#FAFAF8] flex items-center justify-center text-[11px] font-bold">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-[19px] h-[19px] text-[#6B6B67]" strokeWidth={1.8} />
                  )}
                  <ChevronDown className={cn("w-3.5 h-3.5 text-[#6B6B67] transition-transform duration-150", isUserDropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-[#E5E5E0] bg-white overflow-hidden"
                    >
                      <div className="px-4 py-3.5 border-b border-[#E5E5E0]">
                        <p className="text-sm font-medium text-[#141413] truncate">{displayName}</p>
                        <p className="text-xs text-[#6B6B67] truncate mt-0.5">{displayEmail}</p>
                      </div>
                      <div className="p-1.5 py-2">
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
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6B6B67] hover:text-[#141413] hover:bg-[#F4F4F1] transition-colors"
                          >
                            <Icon className="w-4 h-4" strokeWidth={1.8} />
                            {label}
                          </Link>
                        ))}
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full mt-1"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.8} />
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
                className="hidden sm:flex ml-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium border border-[#E5E5E0] text-[#141413] hover:bg-[#141413] hover:text-[#FAFAF8] hover:border-[#141413] transition-all duration-200"
              >
                Sign In
              </Link>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors duration-150 text-[#6B6B67] hover:text-[#141413] ml-1"
            >
              <Menu className="w-[19px] h-[19px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile fullscreen menu ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex flex-col bg-[#FAFAF8]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5E5E0] shrink-0">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-base tracking-[0.3em] text-[#141413]">
                HERMES
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-[10px] hover:bg-[#F4F4F1] transition-colors text-[#6B6B67]">
                <X className="w-[19px] h-[19px]" strokeWidth={1.8} />
              </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="px-6 pt-5 pb-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B67]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-[#E5E5E0] rounded-[10px] py-3 pl-11 pr-4 text-sm bg-[#F4F4F1] text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#141413] transition-colors"
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
                    className="flex items-center justify-between py-4 text-lg font-light border-b border-[#E5E5E0] text-[#141413] hover:text-[#6B6B67] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {!authLoading && user && (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-[#6B6B67] mt-6 mb-2 font-semibold">Account</p>
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
                        className="flex items-center justify-between py-4 text-base font-light border-b border-[#E5E5E0] text-[#6B6B67] hover:text-[#141413] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </>
              )}
            </nav>

            {/* Bottom actions */}
            <div className="px-6 pb-8 pt-4 border-t border-[#E5E5E0] shrink-0 space-y-2.5">
              {!authLoading && user ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-[10px] border border-[#E5E5E0] text-sm font-medium text-[#141413] hover:bg-[#F4F4F1] transition-colors">
                    <Heart className="w-4 h-4" strokeWidth={1.8} />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-[#141413] text-[#FAFAF8] font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-4 h-4" strokeWidth={1.8} />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  <button onClick={handleSignOut} disabled={signingOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors disabled:opacity-50">
                    <LogOut className="w-4 h-4" strokeWidth={1.8} />
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : !authLoading ? (
                <>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-[10px] border border-[#E5E5E0] text-sm font-medium text-[#141413] hover:bg-[#F4F4F1] transition-colors">
                    <Heart className="w-4 h-4" strokeWidth={1.8} />
                    Wishlist
                  </Link>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-[#141413] text-[#FAFAF8] font-medium text-sm hover:opacity-90 transition-opacity">
                    <User className="w-4 h-4" strokeWidth={1.8} />
                    Sign In
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