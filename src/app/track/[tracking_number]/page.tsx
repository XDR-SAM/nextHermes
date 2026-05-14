"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle,
  Circle,
  Clock,
  Package,
  Truck,
  Home,
  MapPin,
  PackageCheck,
  XCircle,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStage {
  key: string;
  label: string;
  description: string;
  completed_at: string | null;
  is_active: boolean;
  is_completed: boolean;
  is_cancelled: boolean;
}

interface TrackResult {
  tracking_number: string;
  order_number: string;
  invoice_number: string | null;
  status: string;
  tracking_link: string;
  timeline: TimelineStage[];
  items: { name: string; quantity: number; unit_price: number; total: number }[];
  subtotal: number;
  shipping_address: string | null;
  placed_at: string;
}

function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 bg-white/5 rounded w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 mt-0.5" />
            <div className="flex-1">
              <div className="h-4 bg-white/5 rounded w-32 mb-2" />
              <div className="h-3 bg-white/5 rounded w-64" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrackPage({ params }: { params: Promise<{ tracking_number: string }> }) {
  const { tracking_number } = use(params);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tracking_number) return;

    const fetchTracking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/track/${encodeURIComponent(tracking_number)}`);
        const data = await res.json();
        if (res.ok) {
          setResult(data);
        } else {
          setError(data.error || "Order not found");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [tracking_number]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.tracking_link || `https://next-hermes.vercel.app/track/${tracking_number}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E0]">
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#141413] mb-1">Track Your Order</h1>
              <p className="text-[#6B6B67]">Enter your tracking number to see real-time updates</p>
            </div>
            <Link
              href="/orders"
              className="flex items-center gap-2 text-sm text-[#6B6B67] hover:text-[#141413] transition-colors"
            >
              View My Orders
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-2xl">
        {/* Tracking Input */}
        <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B67]" />
              <input
                type="text"
                defaultValue={tracking_number}
                placeholder="Enter tracking number (e.g. TRK-...)"
                className="w-full pl-11 pr-4 py-3 bg-[#FAFAF8] border border-[#E5E5E0] rounded-xl text-[#141413] placeholder:text-[#ABAB9A] focus:outline-none focus:ring-2 focus:ring-[#141413] focus:ring-offset-2 font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading && <OrderSkeleton />}

        {error && !loading && (
          <div className="bg-white rounded-2xl border border-[#E5E5E0] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-[#141413] mb-2">Order Not Found</h2>
            <p className="text-[#6B6B67] mb-6 max-w-sm mx-auto">
              {error}. Please check your tracking number and try again, or{" "}
              <Link href="/contact" className="text-[#141413] underline hover:no-underline">
                contact support
              </Link>
              .
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 bg-[#141413] text-[#FAFAF8] px-6 py-3 rounded-full text-sm font-semibold hover:opacity-85 transition-opacity"
            >
              View My Orders
            </Link>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E5E5E0] overflow-hidden">
              {/* Status Banner */}
              <div className="bg-[#141413] px-6 py-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-[#ABAB9A] uppercase tracking-wider mb-1">Order Status</p>
                  <p className="text-xl font-bold text-white capitalize">{result.status.replace("_", " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#ABAB9A] uppercase tracking-wider mb-1">Order Number</p>
                  <p className="text-sm font-mono font-semibold text-white">{result.order_number}</p>
                  {result.invoice_number && (
                    <p className="text-xs text-[#ABAB9A] font-mono">{result.invoice_number}</p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#E5E5E0]">
                <div>
                  <p className="text-xs text-[#6B6B67] uppercase tracking-wider mb-1">Tracking #</p>
                  <p className="text-sm font-mono font-semibold text-[#141413] break-all">{result.tracking_number}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6B67] uppercase tracking-wider mb-1">Placed On</p>
                  <p className="text-sm font-medium text-[#141413]">
                    {new Date(result.placed_at).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6B67] uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-bold text-[#141413]">${result.subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B6B67] uppercase tracking-wider mb-1">Items</p>
                  <p className="text-sm font-medium text-[#141413]">{result.items.length} item{result.items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Share Tracking Link */}
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5E0]">
                  <input
                    type="text"
                    value={result.tracking_link}
                    readOnly
                    className="flex-1 text-xs font-mono text-[#6B6B67] bg-transparent focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141413] text-white rounded-lg text-xs font-medium hover:opacity-85 transition-opacity shrink-0"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
                <p className="text-xs text-[#ABAB9A] mt-2">
                  Share this link with anyone to let them track this order.
                </p>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
              <h2 className="text-lg font-bold text-[#141413] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Delivery Progress
              </h2>

              <div className="space-y-0">
                {result.timeline.map((stage, index) => {
                  const isCancelled = stage.is_cancelled;
                  return (
                    <div key={stage.key} className="relative">
                      {/* Connector line */}
                      {index < result.timeline.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-4 top-10 w-0.5 h-6",
                            stage.is_completed ? "bg-[#22c55e]" : "bg-[#E5E5E0]"
                          )}
                        />
                      )}

                      <div className="flex items-start gap-4 pb-6 last:pb-0">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2",
                            stage.is_completed
                              ? "bg-emerald-500 border-emerald-500"
                              : stage.is_active
                              ? "bg-white border-[#141413]"
                              : isCancelled
                              ? "bg-red-500 border-red-500"
                              : "bg-white border-[#E5E5E0]"
                          )}
                        >
                          {stage.is_completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : stage.is_active ? (
                            <Clock className="w-4 h-4 text-[#141413]" />
                          ) : isCancelled ? (
                            <XCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#E5E5E0]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                stage.is_completed || stage.is_active
                                  ? "text-[#141413]"
                                  : "text-[#ABAB9A]"
                              )}
                            >
                              {stage.label}
                            </p>
                            {stage.is_active && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#141413] text-white rounded-full uppercase tracking-wider">
                                Current
                              </span>
                            )}
                            {isCancelled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full uppercase tracking-wider">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6B67] mt-0.5">{stage.description}</p>
                          {stage.completed_at && (
                            <p className="text-xs text-[#ABAB9A] mt-1">
                              {new Date(stage.completed_at).toLocaleString("en-US", {
                                month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>

                        {/* Icon for stage */}
                        <div className="shrink-0 mt-0.5">
                          {stage.key === "shipped" && !isCancelled && (
                            <Truck className="w-4 h-4 text-[#6B6B67]" />
                          )}
                          {stage.key === "delivered" && !isCancelled && (
                            <PackageCheck className="w-4 h-4 text-emerald-500" />
                          )}
                          {(stage.key === "pending" || stage.key === "confirmed" || stage.key === "processing") && !isCancelled && (
                            <Package className="w-4 h-4 text-[#ABAB9A]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            {result.items.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
                <h2 className="text-lg font-bold text-[#141413] mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                <div className="space-y-3">
                  {result.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-3 border-b border-[#F0F0EC] last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#141413]">{item.name}</p>
                        <p className="text-xs text-[#6B6B67]">
                          Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#141413]">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E0] mt-4">
                  <p className="text-sm font-bold text-[#141413]">Total</p>
                  <p className="text-lg font-bold text-[#141413]">${result.subtotal.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {result.shipping_address && (
              <div className="bg-white rounded-2xl border border-[#E5E5E0] p-6">
                <h2 className="text-lg font-bold text-[#141413] mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <p className="text-sm text-[#6B6B67] whitespace-pre-line">{result.shipping_address}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}