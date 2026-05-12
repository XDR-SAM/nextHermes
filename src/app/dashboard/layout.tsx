"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col",
          "transform transition-transform duration-300 lg:transform-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">H</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Hermes</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/5">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Bottom Navigation (Mobile) ───────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#0d0d0d] border-t border-white/5 lg:hidden safe-area-bottom">
      <div className="flex items-center">
        {SIDEBAR_ITEMS.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex-1">
              <div className={cn(
                "flex flex-col items-center gap-1 py-3 transition-colors",
                isActive ? "text-white" : "text-white/40"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // For demo purposes, we'll allow access even without auth (the useAuth hook just tries to get profile)
  // In production, you'd redirect:
  // if (!profile) { router.push("/login"); return null; }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-[#0d0d0d] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">H</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Hermes</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
