"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  DollarSign,
  Package,
  ChevronRight,
  ExternalLink,
  MapPin,
  User,
  Lock,
  Loader2,
  CheckCircle,
  Phone,
  Mail,
  Camera,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile } from "@/lib/auth";

// Types
interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

// Mock orders data for dashboard preview
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    order_number: "ORD-2024-1847",
    date: "Mar 15, 2024",
    status: "Delivered",
    total: 518.99,
    items: [
      { name: "Premium Wireless Headphones", qty: 1, price: 299.99, image: "https://picsum.photos/seed/h1/80/80" },
      { name: "Titanium Running Shoes", qty: 1, price: 219.0, image: "https://picsum.photos/seed/s1/80/80" },
    ],
  },
  {
    id: "ORD-002",
    order_number: "ORD-2024-1623",
    date: "Feb 28, 2024",
    status: "Shipped",
    total: 449.99,
    items: [
      { name: "Smart Fitness Watch Pro", qty: 1, price: 449.99, image: "https://picsum.photos/seed/w1/80/80" },
    ],
  },
];

// Stat Card
function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  subtext?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:bg-[var(--bg-card)]/80 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text)] mb-1">{value}</p>
      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">{label}</p>
      {subtext && <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60">{subtext}</p>}
    </motion.div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Delivered: "text-emerald-400 bg-emerald-400/10",
    Shipped: "text-blue-400 bg-blue-400/10",
    Processing: "text-purple-400 bg-purple-400/10",
    Pending: "text-amber-400 bg-amber-400/10",
    Cancelled: "text-red-400 bg-red-400/10",
  };
  const cls = colors[status] || "text-[var(--text-secondary)] bg-white/5";
  return (
    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", cls)}>
      {status}
    </span>
  );
}

// Overview Tab
function OverviewTab({ profile }: { profile: { full_name?: string | null; email?: string } | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <User className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {profile?.email || "Loading..."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Orders" value="12" icon={ShoppingBag} subtext="Lifetime purchases" delay={0.1} />
        <StatCard label="Wishlist Items" value="7" icon={Heart} subtext="Items saved" delay={0.15} />
        <StatCard label="Total Spent" value="$1,847.50" icon={DollarSign} subtext="Across all orders" delay={0.2} />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Recent Orders</h2>
          <Link href="/orders" className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_ORDERS.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-[var(--text)]">{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text)]">${order.total.toFixed(2)}</span>
                  <button className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
                    Track
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Items preview */}
              <div className="flex gap-3 overflow-x-auto">
                {order.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2.5 bg-white/5 rounded-lg p-2 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] opacity-60">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Track Order", desc: "Check order status", icon: Package, href: "/orders" },
            { label: "Browse Products", desc: "Explore our catalog", icon: ShoppingBag, href: "/products" },
            { label: "Saved Addresses", desc: "Manage delivery", icon: MapPin, href: "/profile" },
          ].map(({ label, desc, icon: Icon, href }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <Link href={href}>
                <div className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text)] transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text)] mb-1">{label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Orders Tab
function OrdersTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Orders</h1>
        <Link href="/orders" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--text)]">{order.order_number}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">{order.date}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--text)]">${order.total.toFixed(2)}</span>
              <Link href="/orders" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                Details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Wishlist Tab
function WishlistTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Wishlist</h1>
        <Link href="/wishlist" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
          View all
        </Link>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-[var(--text-secondary)]" />
        <p className="text-[var(--text-secondary)] mb-4">You have 7 items in your wishlist</p>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--bg)] px-6 py-3 rounded-full font-semibold text-sm hover:bg-[var(--accent)]/90 transition-colors"
        >
          View Wishlist
        </Link>
      </div>
    </motion.div>
  );
}

// Profile Tab
function ProfileTab({ profile }: { profile: { full_name?: string | null; email?: string; avatar_url?: string | null } | null }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.full_name || "");
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg space-y-6"
    >
      <h1 className="text-2xl font-bold text-[var(--text)]">Profile</h1>

      {/* Avatar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--text-secondary)]" />
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors">
            <Camera className="w-4 h-4" />
            Change Photo
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="email"
              value={profile?.email || ""}
              readOnly
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-secondary)] cursor-not-allowed opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all",
            saved ? "bg-emerald-500 text-white" : "bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90",
            saving && "opacity-70 cursor-not-allowed"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-[var(--text-secondary)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">Change Password</h3>
        </div>
        <div className="space-y-3">
          {["Current Password", "New Password", "Confirm Password"].map((label, i) => (
            <input
              key={label}
              type="password"
              placeholder={label}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
            />
          ))}
          <button className="px-6 py-3 rounded-full font-semibold bg-white/10 border border-[var(--border)] text-[var(--text)] hover:bg-white/20 transition-colors text-sm">
            Update Password
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Settings Tab (placeholder)
function SettingsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Settings</h1>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center">
        <p className="text-[var(--text-secondary)]">Account settings coming soon.</p>
      </div>
    </motion.div>
  );
}

// Tab type
type Tab = "overview" | "orders" | "wishlist" | "profile" | "settings";

// Tab Content Map
function TabContent({ tab, profile }: { tab: Tab; profile: { full_name?: string | null; email?: string; avatar_url?: string | null } | null }) {
  switch (tab) {
    case "overview": return <OverviewTab profile={profile} />;
    case "orders": return <OrdersTab />;
    case "wishlist": return <WishlistTab />;
    case "profile": return <ProfileTab profile={profile} />;
    case "settings": return <SettingsTab />;
    default: return <OverviewTab profile={profile} />;
  }
}

// Sidebar nav items
const NAV_ITEMS: { tab: Tab; label: string; icon: React.ElementType }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "orders", label: "Orders", icon: Package },
  { tab: "wishlist", label: "Wishlist", icon: Heart },
  { tab: "profile", label: "Profile", icon: User },
  { tab: "settings", label: "Settings", icon: Lock },
];

// Main Page
export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="container mx-auto px-6 py-8">
        {/* Mobile Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 lg:hidden scrollbar-hide">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
                activeTab === tab
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8 space-y-1">
              {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                    activeTab === tab
                      ? "bg-white text-black"
                      : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <TabContent tab={activeTab} profile={profile} />
          </div>
        </div>
      </div>
    </main>
  );
}
