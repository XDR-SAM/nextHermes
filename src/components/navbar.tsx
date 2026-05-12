"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useThemeStore, toggleTheme } from "@/store/theme-store";
import { CartDrawer } from "./cart-drawer";

const NAV_LINKS = [
  { label: "Home", href: "/" },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = useThemeStore((s) => s.theme);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.wishlistItems);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isDark = theme === "dark";

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

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? isDark
              ? "bg-black/90 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.1)]"
              : "bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.1)]"
            : isDark
            ? "bg-black/80"
            : "bg-white/80"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "font-bold text-xl tracking-[0.2em] shrink-0 transition-colors",
              isDark ? "text-white" : "text-black"
            )}
          >
            HERMES
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors",
                isDark ? "text-gray-400" : "text-gray-500"
              )} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full border rounded-full py-2 pl-10 pr-4 text-sm placeholder:transition-colors focus:outline-none transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:bg-white/10"
                    : "bg-black/5 border-black/10 text-black placeholder:text-gray-400 focus:border-black/30 focus:bg-black/10"
                )}
              />
            </div>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-full transition-all",
                isDark
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-black/60 hover:text-black hover:bg-black/10"
              )}
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
              className={cn(
                "relative p-2 rounded-full transition-all",
                isDark
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-black/60 hover:text-black hover:bg-black/10"
              )}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center",
                  isDark ? "bg-white text-black" : "bg-black text-white"
                )}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={cn(
                "relative p-2 rounded-full transition-all",
                isDark
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-black/60 hover:text-black hover:bg-black/10"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center",
                    isDark ? "bg-white text-black" : "bg-black text-white"
                  )}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User Avatar / Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1 p-2 rounded-full transition-all",
                  isDark
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-black/60 hover:text-black hover:bg-black/10"
                )}
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
                    className={cn(
                      "absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl overflow-hidden border",
                      isDark
                        ? "bg-[#111] border-white/10"
                        : "bg-white border-black/10"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-3 border-b",
                      isDark ? "border-white/5" : "border-black/5"
                    )}>
                      <p className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white" : "text-black"
                      )}>John Doe</p>
                      <p className={cn(
                        "text-xs",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}>john@example.com</p>
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
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                            isDark
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-black/70 hover:text-black hover:bg-black/10"
                          )}
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
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isDark
                    ? "text-white/70 hover:text-white"
                    : "text-black/70 hover:text-black"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-0.5 left-0 w-0 h-px transition-all duration-300 group-hover:w-full",
                  isDark ? "bg-white" : "bg-black"
                )} />
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={cn(
              "md:hidden p-2 rounded-full transition-all",
              isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-black/60 hover:text-black hover:bg-black/10"
            )}
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
            className={cn(
              "fixed inset-0 z-[60] flex flex-col backdrop-blur-xl",
              isDark ? "bg-black/95" : "bg-white/95"
            )}
          >
            {/* Mobile Menu Header */}
            <div className={cn(
              "flex items-center justify-between px-6 h-16 border-b",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              <Link
                href="/"
                className={cn(
                  "font-bold text-xl tracking-[0.2em]",
                  isDark ? "text-white" : "text-black"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HERMES
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isDark
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-black/60 hover:text-black hover:bg-black/10"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className={cn(
              "px-6 py-4 border-b",
              isDark ? "border-white/5" : "border-black/5"
            )}>
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
                  isDark ? "text-gray-400" : "text-gray-500"
                )} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full border rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:transition-colors focus:outline-none transition-all",
                    isDark
                      ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30"
                      : "bg-black/5 border-black/10 text-black placeholder:text-gray-400 focus:border-black/30"
                  )}
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
                      className={cn(
                        "block py-4 text-2xl font-light border-b transition-colors",
                        isDark
                          ? "text-white/80 hover:text-white border-white/5"
                          : "text-black/80 hover:text-black border-black/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </nav>

            {/* Mobile Bottom Actions */}
            <div className={cn(
              "px-6 py-6 border-t flex items-center gap-4",
              isDark ? "border-white/10" : "border-black/10"
            )}>
              {/* Theme toggle in mobile */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); toggleTheme(); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-all",
                  isDark
                    ? "border-white/20 text-white/80 hover:text-white hover:border-white/40"
                    : "border-black/20 text-black/80 hover:text-black hover:border-black/40"
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
                  isDark
                    ? "border-white/20 text-white/80 hover:text-white hover:border-white/40"
                    : "border-black/20 text-black/80 hover:text-black hover:border-black/40"
                )}
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </span>
              </Link>
            </div>

            {/* Cart button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-full font-medium text-sm transition-all",
                  isDark
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-black text-white hover:bg-black/90"
                )}
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
