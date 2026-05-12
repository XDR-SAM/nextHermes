"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Heart,
  DollarSign,
  Package,
  ArrowRight,
  ChevronRight,
  MapPin,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: "https://picsum.photos/seed/alexmorgan/120/120",
  totalOrders: 12,
  wishlistItems: 7,
  totalSpent: 1847.50,
};

const MOCK_ORDERS = [
  {
    id: "ORD-2024-1847",
    date: "Mar 15, 2024",
    status: "Delivered",
    statusColor: "text-emerald-400 bg-emerald-400/10",
    items: [
      { name: "Premium Wireless Headphones", qty: 1, price: 299.99, image: "https://picsum.photos/seed/headphones1/80/80" },
      { name: "Titanium Running Shoes", qty: 1, price: 219.00, image: "https://picsum.photos/seed/shoes1/80/80" },
    ],
    total: 518.99,
  },
  {
    id: "ORD-2024-1623",
    date: "Feb 28, 2024",
    status: "Shipped",
    statusColor: "text-blue-400 bg-blue-400/10",
    items: [
      { name: "Smart Fitness Watch Pro", qty: 1, price: 449.99, image: "https://picsum.photos/seed/watch1/80/80" },
    ],
    total: 449.99,
  },
  {
    id: "ORD-2024-1401",
    date: "Jan 10, 2024",
    status: "Delivered",
    statusColor: "text-emerald-400 bg-emerald-400/10",
    items: [
      { name: "Organic Cotton Oversized Tee", qty: 2, price: 59.99, image: "https://picsum.photos/seed/tee1/80/80" },
      { name: "Ceramic Pour-Over Coffee Set", qty: 1, price: 79.99, image: "https://picsum.photos/seed/coffee1/80/80" },
    ],
    total: 199.97,
  },
];

const QUICK_LINKS = [
  { label: "Track Order", desc: "Check your order status", icon: Package, href: "/dashboard/orders" },
  { label: "Browse Products", desc: "Explore our catalog", icon: ShoppingBag, href: "/products" },
  { label: "Get Help", desc: "Contact support", icon: HelpCircle, href: "/dashboard/help" },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, subtext, delay }: {
  label: string; value: string; icon: React.ElementType; subtext?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white/3 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/50" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/40 uppercase tracking-widest">{label}</p>
      {subtext && <p className="text-xs text-white/25 mt-1">{subtext}</p>}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
            <Image src={MOCK_USER.avatar} alt={MOCK_USER.name} fill className="object-cover" sizes="64px" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {MOCK_USER.name.split(" ")[0]}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{MOCK_USER.email}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Orders"
            value={MOCK_USER.totalOrders.toString()}
            icon={ShoppingBag}
            subtext="Lifetime purchases"
            delay={0.1}
          />
          <StatCard
            label="Wishlist Items"
            value={MOCK_USER.wishlistItems.toString()}
            icon={Heart}
            subtext="Items saved"
            delay={0.15}
          />
          <StatCard
            label="Total Spent"
            value={`$${MOCK_USER.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            subtext="Across all orders"
            delay={0.2}
          />
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
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
                className="bg-white/3 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-white">{order.id}</span>
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", order.statusColor)}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">${order.total.toFixed(2)}</span>
                    <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
                      Track
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Items preview */}
                <div className="flex gap-3">
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2.5 bg-white/3 rounded-lg p-2">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/70 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-white/40">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ label, desc, icon: Icon, href }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              >
                <Link href={href}>
                  <div className="group bg-white/3 border border-white/5 rounded-2xl p-5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                      <Icon className="w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Addresses shortcut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Link href="/dashboard/addresses">
            <div className="group bg-white/3 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Saved Addresses</p>
                  <p className="text-xs text-white/40">Manage your delivery addresses</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
