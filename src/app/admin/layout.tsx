"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Profile } from "@/lib/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/tenants", label: "Tenants", icon: "🏢" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#171717", color:"#fafafa", fontFamily:"sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"32px", marginBottom:"12px" }}>🛒</div>
        <div style={{ color:"#898989" }}>Loading...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#171717" }}>
      <aside style={{ width:"240px", background:"#0f0f0f", borderRight:"1px solid #2e2e2e", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"24px 20px", borderBottom:"1px solid #2e2e2e" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"24px" }}>🛒</span>
            <span style={{ fontSize:"16px", fontWeight:"600", color:"#fafafa" }}>nextHermes</span>
          </div>
        </div>
        <nav style={{ flex:"1", padding:"16px 12px" }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"10px 12px", borderRadius:"8px", marginBottom:"4px",
              textDecoration:"none",
              color: pathname === item.href ? "#3ecf8e" : "#b4b4b4",
              background: pathname === item.href ? "rgba(62,207,142,0.08)" : "transparent",
              fontSize:"14px", fontWeight:"500", transition:"150ms ease",
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:"16px", borderTop:"1px solid #2e2e2e" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#363636", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", color:"#fafafa" }}>
              {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex:"1", minWidth:"0" }}>
              <div style={{ fontSize:"13px", fontWeight:"500", color:"#fafafa", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile?.full_name || "User"}</div>
              <div style={{ fontSize:"11px", color: ROLE_COLORS[profile?.role || "user"], fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.5px" }}>{ROLE_LABELS[profile?.role || "user"]}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{ width:"100%", padding:"8px", borderRadius:"6px", border:"1px solid #363636", background:"transparent", color:"#898989", fontSize:"13px", cursor:"pointer", transition:"150ms ease" }}>Sign Out</button>
        </div>
      </aside>
      <main style={{ flex:"1", overflow:"auto" }}>{children}</main>
    </div>
  );
}
