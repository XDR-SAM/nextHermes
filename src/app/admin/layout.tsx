"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/banners", label: "Banners", icon: "🎨" },
  { href: "/admin/orders", label: "Orders", icon: "🛒" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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

  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#FAFAF8", color: "#141413",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛒</div>
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
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 40, display: "none"
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: "256px",
        background: "#0a0a0a",
        borderRight: "1px solid #E5E5E0",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        transition: "transform 0.3s ease",
      }} className="sidebar">
        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid #E5E5E0"
        }}>
          <Link href="/admin" style={{
            display: "flex", alignItems: "center", gap: "10px",
            textDecoration: "none"
          }}>
            <span style={{ fontSize: "24px" }}>🛒</span>
            <span style={{
              fontSize: "16px", fontWeight: "700", color: "#fafafa",
              letterSpacing: "0.5px"
            }}>HERMES ADMIN</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: "1", padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 14px", borderRadius: "8px", marginBottom: "4px",
                textDecoration: "none",
                color: isActive ? "#fafafa" : "#898989",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                fontSize: "14px", fontWeight: isActive ? "600" : "500",
                transition: "all 0.15s ease",
              }}
              onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{ padding: "16px", borderTop: "1px solid #E5E5E0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "white", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "16px", color: "#fafafa", fontWeight: "600"
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: "1", minWidth: 0 }}>
              <div style={{
                fontSize: "13px", fontWeight: "500", color: "#fafafa",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>{profile?.full_name || "Admin"}</div>
              <div style={{
                fontSize: "11px", color: ROLE_COLORS[profile?.role || "user"],
                fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px"
              }}>{ROLE_LABELS[profile?.role || "user"]}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{
            width: "100%", padding: "8px", borderRadius: "6px",
            border: "1px solid #E5E5E0", background: "transparent",
            color: "#898989", fontSize: "13px", cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#E5E5E0";
            e.currentTarget.style.color = "#898989";
          }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: "1",
        marginLeft: "256px",
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <h1 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#141413",
          }}>{getPageTitle()}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#6B6B67" }}>
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
            transform: translateX(${mobileMenuOpen ? "0" : "-100%"});
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          main, header {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
