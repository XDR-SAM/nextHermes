"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: { full_name: string | null; email: string } | null;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalCategories: 0, totalOrders: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile);

      const [productsRes, categoriesRes, ordersRes, usersRes, recentOrdersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders")
          .select("id, created_at, total, status, profiles(full_name, email)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalProducts: productsRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalUsers: usersRes.count || 0,
      });
      setRecentOrders((recentOrdersRes.data || []) as unknown as RecentOrder[]);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD"
  }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return { bg: "rgba(234, 179, 8, 0.1)", color: "#eab308", border: "rgba(234, 179, 8, 0.3)" };
      case "processing": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" };
      case "shipped": return { bg: "rgba(168, 85, 247, 0.1)", color: "#a855f7", border: "rgba(168, 85, 247, 0.3)" };
      case "delivered": return { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "rgba(34, 197, 94, 0.3)" };
      case "cancelled": return { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" };
      default: return { bg: "rgba(137, 137, 137, 0.1)", color: "#898989", border: "rgba(137, 137, 137, 0.3)" };
    }
  };

  if (loading) return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", padding: "24px", animation: "pulse 1.5s ease-in-out infinite"
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#F4F4F1", marginBottom: "16px" }} />
            <div style={{ width: "60px", height: "28px", background: "#F4F4F1", borderRadius: "4px" }} />
            <div style={{ width: "80px", height: "14px", background: "#F4F4F1", borderRadius: "4px", marginTop: "8px" }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>
          Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"}
        </h1>
        <p style={{ color: "#6B6B67", margin: 0 }}>Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        {[
          { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "#3b82f6" },
          { label: "Categories", value: stats.totalCategories, icon: "🏷️", color: "#a855f7" },
          { label: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "#22c55e" },
          { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#f59e0b" },
        ].map((stat, index) => (
          <div key={index} style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", padding: "24px", transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = stat.color;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#E5E5E0";
            e.currentTarget.style.transform = "translateY(0)";
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "32px" }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: stat.color, marginBottom: "4px" }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontSize: "14px", color: "#6B6B67" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{
        background: "white", border: "1px solid #E5E5E0",
        borderRadius: "12px", padding: "24px", marginBottom: "32px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{
            fontSize: "13px", color: "#3b82f6", textDecoration: "none",
            fontWeight: "500"
          }}>View all →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6B6B67" }}>
            No orders yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Order ID", "Customer", "Date", "Total", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: "12px",
                      color: "#6B6B67", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const statusStyle = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#141413" }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", color: "#141413", fontWeight: "500" }}>
                          {order.profiles?.full_name || "Guest"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6B6B67" }}>
                          {order.profiles?.email || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6B6B67" }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#141413" }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "12px",
                          fontWeight: "600", background: statusStyle.bg, color: statusStyle.color,
                          border: "1px solid", borderColor: statusStyle.border
                        }}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: "white", border: "1px solid #E5E5E0",
        borderRadius: "12px", padding: "24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: "0 0 20px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          {[
            { label: "Add Product", href: "/admin/products", icon: "➕", color: "#22c55e" },
            { label: "Add Category", href: "/admin/categories", icon: "🏷️", color: "#a855f7" },
            { label: "View Orders", href: "/admin/orders", icon: "🛒", color: "#3b82f6" },
            { label: "Manage Users", href: "/admin/users", icon: "👥", color: "#f59e0b" },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 18px", borderRadius: "8px",
              background: "#F4F4F1", border: "1px solid #E5E5E0",
              textDecoration: "none", color: "#141413", fontSize: "14px",
              fontWeight: "500", transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.background = `${action.color}10`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#E5E5E0";
              e.currentTarget.style.background = "#F4F4F1";
            }}>
              <span>{action.icon}</span> {action.label}
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
