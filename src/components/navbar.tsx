"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { CartDrawer } from "./cart-drawer";

// Nav links configuration
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Custom event name for cart drawer toggle
export const CART_DRAWER_TOGGLE = "hermes:cart:toggle";

export function toggleCartDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_DRAWER_TOGGLE));
  }
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { scrollY } = useScroll();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.wishlistItems);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Track scroll for glassmorphism + shrink effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Listen for cart drawer toggle from cart-drawer component
  useEffect(() => {
    const handler = () => setIsCartOpen((prev) => !prev);
    window.addEventListener(CART_DRAWER_TOGGLE, handler);
    return () => window.removeEventListener(CART_DRAWER_TOGGLE, handler);
  }, []);

  // Close mobile menu on route change / resize
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navbarHeight = isScrolled ? 56 : 72;

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-black/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.1)]"
            : "bg-black"
        )}
        animate={{ height: navbarHeight }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-white font-bold text-xl tracking-[0.2em] shrink-0"
          >
            HERMES
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center gap-1">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User Avatar / Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">John Doe</p>
                      <p className="text-xs text-gray-500">john@example.com</p>
                    </div>
                    <div className="p-1">
                      {[
                        { icon: User, label: "Profile", href: "/profile" },
                        { icon: Package, label: "Orders", href: "/orders" },
                        { icon: Settings, label: "Settings", href: "/settings" },
                      ].map(({ icon: Icon, label, href }) => (
                        <Link
                          key={label}
                          href={href}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
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
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
              <Link
                href="/"
                className="text-white font-bold text-xl tracking-[0.2em]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HERMES
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-6 py-6">
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
                      className="block py-4 text-2xl font-light text-white/80 hover:text-white border-b border-white/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="px-6 py-6 border-t border-white/10 flex items-center gap-4">
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
