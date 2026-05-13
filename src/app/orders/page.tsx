"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  product_id?: string;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  subtotal?: number;
  tax?: number;
  shipping_cost?: number;
  items: OrderItem[];
  item_count: number;
  tracking_number?: string;
  shipping_address?: Record<string, string>;
  shipping_method?: string;
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

// Expanded Order Details Component
function OrderDetails({ order, onReorder, onTrack }: { order: Order; onReorder: (items: OrderItem[]) => void; onTrack: (tracking: string) => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-6 mt-6 border-t border-[var(--border)]">
        {/* Order Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Subtotal</p>
            <p className="text-sm font-medium text-[var(--text)]">${(order.subtotal || order.total).toFixed(2)}</p>
          </div>
          {order.tax !== undefined && order.tax > 0 && (
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tax</p>
              <p className="text-sm font-medium text-[var(--text)]">${order.tax.toFixed(2)}</p>
            </div>
          )}
          {order.shipping_cost !== undefined && order.shipping_cost > 0 && (
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Shipping</p>
              <p className="text-sm font-medium text-[var(--text)]">${order.shipping_cost.toFixed(2)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total</p>
            <p className="text-sm font-bold text-[var(--text)]">${order.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Shipping Info */}
        {order.shipping_method && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-[var(--text-secondary)]" />
              <p className="text-sm font-medium text-[var(--text)]">{order.shipping_method}</p>
            </div>
            {order.tracking_number && (
              <p className="text-xs text-[var(--text-secondary)]">
                Tracking: <span className="font-mono">{order.tracking_number}</span>
              </p>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Items</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                <Image
                  src={item.image || "https://picsum.photos/100"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)] truncate">{item.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--text)] shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => onReorder(order.items)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg)] rounded-full text-sm font-semibold hover:bg-[var(--accent)]/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reorder
          </button>
          {order.tracking_number && (
            <button
              onClick={() => onTrack(order.tracking_number!)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-[var(--text)] rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Track Order
            </button>
          )}
          <Link
            href={`/orders/${order.id}`}
            className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] text-sm hover:text-[var(--text)] transition-colors"
          >
            View Invoice
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders/me");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleReorder = (items: OrderItem[]) => {
    items.forEach((item) => {
      addItem({
        id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        image: item.image || "https://picsum.photos/100",
        quantity: item.quantity,
      });
    });
    setReorderSuccess("Items added to cart!");
    setTimeout(() => setReorderSuccess(null), 3000);
  };

  const handleTrack = (trackingNumber: string) => {
    // Open tracking URL in new tab (carrier-specific)
    const trackingUrl = `https://track.aftership.com/${trackingNumber}`;
    window.open(trackingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Success Toast */}
      <AnimatePresence>
        {reorderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {reorderSuccess}
          </motion.div>
        )}
      </AnimatePresence>

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
              const isExpanded = expandedOrders.has(order.id);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                >
                  {/* Order Header - Clickable */}
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full text-left p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
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
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
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
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <OrderDetails
                          order={order}
                          onReorder={handleReorder}
                          onTrack={handleTrack}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
