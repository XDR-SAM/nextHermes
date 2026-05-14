"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";
import {
  Store,
  BarChart2,
  TrendingUp,
  Package,
  Tag,
  Megaphone,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/products", label: "Products", icon: Store },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!data) { router.push("/login"); return; }
      setProfile(data as Profile);
      setLoading(false);
    };
    checkAuth();
  }, [pathname, router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getPageTitle = useCallback(() => {
    const current = navItems.find(item => item.href === pathname);
    return current?.label || "Admin";
  }, [pathname]);

  if (!mounted || loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#FAFAF8", color: "#141413",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "12px" }}>
          <ShoppingCart size={32} style={{ color: "#141413" }} />
        </div>
        <div style={{ color: "#6B6B67" }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#FAFAF8",
    }}>
      {/* Mobile Overlay */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar */}
      <aside style={{
        width: "260px",
        background: "linear-gradient(180deg, #111111 0%, #0a0a0a 100%)",
        borderRight: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid #1f1f1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Link href="/admin" style={{
            display: "flex", alignItems: "center", gap: "12px",
            textDecoration: "none"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #141413 0%, #2d2d2d 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <ShoppingCart size={20} style={{ color: "#fafafa" }} />
            </div>
            <span style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#fafafa",
              letterSpacing: "0.5px",
              fontFamily: "system-ui, sans-serif",
            }}>HERMES</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "none",
              padding: "6px",
              border: "none",
              background: "transparent",
              color: "#9ca3af",
              cursor: "pointer",
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: "1", padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ marginBottom: "8px", paddingLeft: "14px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>
              Menu
            </span>
          </div>
          {navItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  color: isActive ? "#fafafa" : "#9ca3af",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                  transition: "all 0.15s ease",
                  fontFamily: "system-ui, sans-serif",
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#d1d5db";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#9ca3af";
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid #1f1f1f",
          background: "rgba(0,0,0,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #3f3f46 0%, #27272a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#fafafa",
              fontWeight: "600",
              flexShrink: 0,
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: "1", minWidth: 0 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#fafafa",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "system-ui, sans-serif",
              }}>{profile?.full_name || "Admin"}</div>
              <div style={{
                fontSize: "11px",
                color: ROLE_COLORS[profile?.role || "user"],
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>{ROLE_LABELS[profile?.role || "user"]}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #2d2d2d",
              background: "transparent",
              color: "#9ca3af",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "system-ui, sans-serif",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#2d2d2d";
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: "1",
        marginLeft: "260px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
        {/* Top Bar */}
        <header style={{
          height: "64px",
          background: "#FAFAF8",
          borderBottom: "1px solid #E5E5E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              padding: "8px",
              border: "none",
              background: "transparent",
              color: "#141413",
              cursor: "pointer",
            }}
            className="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>

          <h1 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#141413",
            fontFamily: "system-ui, sans-serif",
          }}>{getPageTitle()}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#6B6B67", fontFamily: "system-ui, sans-serif" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: "1",
          padding: "32px",
          background: "#FAFAF8",
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Styles */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar {
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
          main, header {
            margin-left: 0 !important;
            padding: 16px !important;
          }
          header {
            padding-left: 12px !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}