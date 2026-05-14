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

// Stat Card with colored left border accent
function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  delay,
  accentColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  subtext?: string;
  delay: number;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
    >
      {/* Colored left border accent */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${accentColor}`}
      />
      
      {/* Icon container */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accentColor.replace('bg-', 'bg-opacity-10 ')}`}>
          <Icon className={`w-7 h-7 ${accentColor.replace('bg-', 'text-')}`} />
        </div>
        <svg className="w-20 h-20 opacity-5 absolute -right-4 -bottom-4" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="80" cy="80" r="60" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="pl-2">
        <p className="text-4xl font-bold text-[#141413] mb-2 tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-[#6B6B67] uppercase tracking-wider mb-1">{label}</p>
        {subtext && (
          <p className="text-xs text-[#6B6B67]/70 mt-1">{subtext}</p>
        )}
      </div>
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
  const cls = colors[status] || "text-[#6B6B67] bg-[#F4F4F1]";
  return (
    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", cls)}>
      {status}
    </span>
  );
}

// Overview Tab
function OverviewTab({ profile }: { profile: { id: string; full_name?: string | null; email?: string; avatar_url?: string | null } | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-[#E5E5E0]">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-[#F4F4F1] shadow-lg">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F4F4F1] to-[#E5E5E0] flex items-center justify-center">
                <User className="w-8 h-8 text-[#6B6B67]" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight leading-tight">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#141413] to-[#6B6B67]">
              {profile?.full_name?.split(" ")[0] || "there"}
            </span>
          </h1>
          <p className="text-[#6B6B67] mt-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {profile?.email || "Loading..."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Orders" value="12" icon={ShoppingBag} subtext="Lifetime purchases" delay={0.1} accentColor="bg-blue-500" />
        <StatCard label="Wishlist Items" value="7" icon={Heart} subtext="Items saved for later" delay={0.15} accentColor="bg-rose-500" />
        <StatCard label="Total Spent" value="$1,847.50" icon={DollarSign} subtext="Across all orders" delay={0.2} accentColor="bg-emerald-500" />
      </div>

      {/* Recent Orders */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#141413] tracking-tight">Recent Orders</h2>
          </div>
          <Link href="/orders" className="flex items-center gap-1 text-sm text-[#6B6B67] hover:text-[#141413] transition-colors font-medium">
            View all orders
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-4">
          {MOCK_ORDERS.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E5E0]/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-[#141413]">{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-[#6B6B67]">{order.date}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-[#141413]">${order.total.toFixed(2)}</span>
                  <button className="flex items-center gap-2 text-sm font-medium text-[#6B6B67] hover:text-[#141413] transition-colors px-4 py-2 rounded-full bg-[#F4F4F1] hover:bg-[#E5E5E0]">
                    Track Order
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Items preview */}
              <div className="flex gap-4 mt-5 overflow-x-auto pb-2">
                {order.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 bg-[#F4F4F1] rounded-xl p-3 min-w-0 shrink-0">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white shadow-sm">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#141413] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[#6B6B67]">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
          <h2 className="text-xl font-bold text-[#141413] tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Track Order", desc: "Check order status & history", icon: Package, href: "/orders", color: "bg-blue-500" },
            { label: "Browse Products", desc: "Explore our catalog", icon: ShoppingBag, href: "/products", color: "bg-emerald-500" },
            { label: "Saved Addresses", desc: "Manage delivery locations", icon: MapPin, href: "/profile", color: "bg-amber-500" },
          ].map(({ label, desc, icon: Icon, href, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
            >
              <Link href={href}>
                <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E5E5E0]/50 overflow-hidden relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color}`} />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                  </div>
                  <p className="text-base font-semibold text-[#141413] mb-1 group-hover:translate-x-1 transition-transform">{label}</p>
                  <p className="text-sm text-[#6B6B67]">{desc}</p>
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
      className="space-y-6"
    >
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E0]">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">Orders</h1>
        </div>
        <Link href="/orders" className="text-sm text-[#6B6B67] hover:text-[#141413] transition-colors font-medium">
          View all
        </Link>
      </div>
      <div className="grid gap-4">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E5E0]/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-[#141413]">{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-[#6B6B67]">{order.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-[#141413]">${order.total.toFixed(2)}</span>
                <Link href="/orders" className="text-sm font-medium text-[#6B6B67] hover:text-[#141413] transition-colors flex items-center gap-1 px-4 py-2 rounded-full bg-[#F4F4F1] hover:bg-[#E5E5E0]">
                  Details <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
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
      className="space-y-6"
    >
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E0]">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">Wishlist</h1>
        </div>
        <Link href="/wishlist" className="text-sm text-[#6B6B67] hover:text-[#141413] transition-colors font-medium">
          View all
        </Link>
      </div>
      <div className="bg-white border border-[#E5E5E0]/50 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <Heart className="w-10 h-10 text-rose-500" />
        </div>
        <p className="text-[#6B6B67] text-lg mb-6">You have 7 items in your wishlist</p>
        <Link
          href="/wishlist"
          className="inline-flex items-center gap-2 bg-[#141413] text-[#FAFAF8] px-8 py-4 rounded-full font-semibold text-base hover:bg-[#141413]/90 transition-colors"
        >
          View Wishlist
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
}

// Profile Tab
function ProfileTab({ profile }: { profile: { id: string; full_name?: string | null; email?: string; avatar_url?: string | null } | null }) {
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
      className="max-w-2xl space-y-8"
    >
      <div className="flex items-center gap-3 pb-6 border-b border-[#E5E5E0]">
        <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">Profile</h1>
      </div>

      {/* Avatar Section */}
      <div className="bg-white border border-[#E5E5E0]/50 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-[#F4F4F1] shadow-lg">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F4F4F1] to-[#E5E5E0] flex items-center justify-center">
                  <User className="w-10 h-10 text-[#6B6B67]" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold text-[#141413] mb-1">{profile?.full_name || "User"}</p>
            <p className="text-[#6B6B67] mb-4 flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-4 h-4" />
              {profile?.email}
            </p>
            <button className="flex items-center gap-2 bg-[#F4F4F1] border border-[#E5E5E0] text-[#141413] px-5 py-2.5 rounded-full text-sm hover:bg-[#E5E5E0] transition-colors font-medium">
              <Camera className="w-4 h-4" />
              Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-[#E5E5E0]/50 rounded-2xl p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-[#141413]">Personal Information</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#6B6B67] mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B67]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded-xl pl-12 pr-4 py-3.5 text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#6B6B67] focus:ring-2 focus:ring-[#6B6B67]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B6B67] mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B67]" />
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded-xl pl-12 pr-4 py-3.5 text-[#6B6B67] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B6B67] mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B67]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded-xl pl-12 pr-4 py-3.5 text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#6B6B67] focus:ring-2 focus:ring-[#6B6B67]/20 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all w-full sm:w-auto justify-center",
            saved ? "bg-emerald-500 text-white" : "bg-[#141413] text-[#FAFAF8] hover:bg-[#141413]/90",
            saving && "opacity-70 cursor-not-allowed"
          )}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : null}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-[#E5E5E0]/50 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-[#6B6B67]" />
          <h2 className="text-lg font-semibold text-[#141413]">Change Password</h2>
        </div>
        <div className="space-y-4">
          {["Current Password", "New Password", "Confirm Password"].map((label) => (
            <input
              key={label}
              type="password"
              placeholder={label}
              className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded-xl px-4 py-3.5 text-sm text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#6B6B67] focus:ring-2 focus:ring-[#6B6B67]/20 transition-all"
            />
          ))}
          <button className="px-8 py-3.5 rounded-full font-semibold bg-[#F4F4F1] border border-[#E5E5E0] text-[#141413] hover:bg-[#E5E5E0] transition-colors text-base">
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
      className="space-y-6"
    >
      <div className="flex items-center gap-3 pb-6 border-b border-[#E5E5E0]">
        <div className="w-1.5 h-6 bg-[#141413] rounded-full"></div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">Settings</h1>
      </div>
      <div className="bg-white border border-[#E5E5E0]/50 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F4F4F1] flex items-center justify-center">
          <Lock className="w-10 h-10 text-[#6B6B67]" />
        </div>
        <p className="text-[#6B6B67] text-lg">Account settings coming soon.</p>
      </div>
    </motion.div>
  );
}

// Tab type
type Tab = "overview" | "orders" | "wishlist" | "profile" | "settings";

// Tab Content Map
function TabContent({ tab, profile }: { tab: Tab; profile: { id: string; full_name?: string | null; email?: string; avatar_url?: string | null } | null }) {
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#6B6B67] animate-spin" />
          <p className="text-[#6B6B67] text-base font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Mobile Tab Nav */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 lg:hidden scrollbar-hide">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all shrink-0",
                activeTab === tab
                  ? "bg-[#141413] text-[#FAFAF8] shadow-lg"
                  : "bg-white border border-[#E5E5E0] text-[#6B6B67] hover:text-[#141413] hover:border-[#141413]/20"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8 bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E0]/50">
              <div className="space-y-1">
                {NAV_ITEMS.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all text-left",
                      activeTab === tab
                        ? "bg-[#141413] text-[#FAFAF8] shadow-md"
                        : "text-[#6B6B67] hover:text-[#141413] hover:bg-[#F4F4F1]"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
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
