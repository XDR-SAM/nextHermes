"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  item_count: number;
}

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    icon: XCircle,
  },
};

// Skeleton
function OrderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-white/5 rounded w-32" />
          <div className="h-5 bg-white/5 rounded w-20" />
        </div>
        <div className="h-3 bg-white/5 rounded w-48 mb-4" />
        <div className="flex gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="w-16 h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Try API route first
        const res = await fetch("/api/orders/me");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          // Static empty state if no API
          setOrders([]);
        }
      } catch {
        // Network error — show empty state
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-2">
            My Orders
          </h1>
          <p className="text-[var(--text-secondary)]">
            {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[var(--text-secondary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
              No orders yet
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
              When you place an order, it will appear here so you can track it easily.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--accent)]/90 transition-colors"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 hover:border-white/10 transition-colors"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-[var(--text)]">
                          {order.order_number}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1",
                            status.bgColor,
                            status.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--text)]">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                      >
                        Details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {order.items.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-[var(--border)] shrink-0"
                        >
                          <Image
                            src={item.image || "https://picsum.photos/100"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <div className="relative w-16 h-16 rounded-lg bg-white/5 border border-[var(--border)] flex items-center justify-center shrink-0">
                          <span className="text-xs text-[var(--text-secondary)]">
                            +{order.items.length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
