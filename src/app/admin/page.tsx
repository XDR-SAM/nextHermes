"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

export default function AdminDashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalTenants: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile);
      const [usersRes, tenantsRes] = await Promise.all([
        supabase.from("profiles").select("id, is_active"),
        supabase.from("tenants").select("id, is_active"),
      ]);
      const allUsers = (usersRes.data || []) as { is_active?: boolean }[];
      const allTenants = (tenantsRes.data || []) as { is_active?: boolean }[];
      setStats({ totalUsers: allUsers.length, totalTenants: allTenants.length, activeUsers: allUsers.filter(u => u.is_active !== false).length });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ padding:"32px", color:"#898989" }}>Loading dashboard...</div>;

  return (
    <div style={{ padding:"32px", maxWidth:"1200px" }}>
      <div style={{ marginBottom:"32px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:"600", color:"#fafafa", margin:"0" }}>Dashboard</h1>
        <p style={{ color:"#898989", margin:"4px 0 0" }}>Welcome back, {profile?.full_name || "Admin"}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"16px", marginBottom:"24px" }}>
        {[
          { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#3ecf8e" },
          { label: "Active Users", value: stats.activeUsers, icon: "✅", color: "#22c55e" },
          { label: "Total Tenants", value: stats.totalTenants, icon: "🏢", color: "#a78bfa" },
          { label: "Your Role", value: ROLE_LABELS[profile?.role || "user"], icon: "🎭", color: ROLE_COLORS[profile?.role || "user"] },
        ].map(stat => (
          <div key={stat.label} style={{ background:"#1e1e1e", border:"1px solid #2e2e2e", borderRadius:"12px", padding:"24px" }}>
            <div style={{ fontSize:"28px", marginBottom:"8px" }}>{stat.icon}</div>
            <div style={{ fontSize:"32px", fontWeight:"700", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize:"13px", color:"#898989", marginTop:"4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#1e1e1e", border:"1px solid #2e2e2e", borderRadius:"12px", padding:"24px" }}>
        <h2 style={{ fontSize:"18px", fontWeight:"600", color:"#fafafa", margin:"0 0 16px" }}>Quick Actions</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"12px" }}>
          {[
            { label: "Add User", href: "/admin/users?action=add", icon: "➕" },
            { label: "Create Tenant", href: "/admin/tenants?action=add", icon: "🏢" },
            { label: "View Settings", href: "/admin/settings", icon: "⚙️" },
          ].map(action => (
            <a key={action.label} href={action.href} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 16px", borderRadius:"8px", background:"#242424", border:"1px solid #363636", textDecoration:"none", color:"#fafafa", fontSize:"14px", fontWeight:"500", transition:"150ms ease" }}>
              <span>{action.icon}</span> {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
