"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import OrderInvoice from "@/components/admin/OrderInvoice";
import { FileText, Package } from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  total?: number;
  product_name?: string | null;
  product?: { name: string | null; metadata: Record<string, unknown> | null } | null;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  total: number | null;
  subtotal: number | null;
  status: string;
  shipping_address: string | null;
  notes: string | null;
  user_id: string;
  order_items: OrderItem[] | null;
  profile_name?: string | null;
  profile_email?: string | null;
  tracking_number?: string | null;
  tracking_link?: string | null;
}

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: "rgba(234, 179, 8, 0.1)", color: "#eab308", border: "rgba(234, 179, 8, 0.3)" },
  processing: { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  shipped: { bg: "rgba(168, 85, 247, 0.1)", color: "#a855f7", border: "rgba(168, 85, 247, 0.3)" },
  delivered: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "rgba(34, 197, 94, 0.3)" },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
};

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, user_id, status, subtotal, shipping_address, notes, created_at, updated_at, tracking_number, tracking_link")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: ordersData, error } = await query;
    if (error) {
      showToast(`Failed to load orders: ${error.message}`, "error");
      setOrders([]);
    } else {
      // Fetch profile names separately to avoid FK join schema cache issues
      const userIds = [...new Set((ordersData || []).map((o: Order) => o.user_id).filter(Boolean))];
      let profileMap: Record<string, { full_name: string | null; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        if (profiles) {
          for (const p of profiles) {
            profileMap[p.id] = { full_name: p.full_name, email: p.email };
          }
        }
      }
      const enriched = (ordersData || []).map((o: Order) => ({
        ...o,
        total: o.subtotal || 0,
        profile_name: profileMap[o.user_id]?.full_name || null,
        profile_email: profileMap[o.user_id]?.email || null,
      }));
      setOrders(enriched as Order[]);
    }
    setLoading(false);
  }, [supabase, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const formatCurrency = (amount: number | null) =>
    amount == null ? "$0.00" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const viewOrderDetails = async (order: Order) => {
    // Fetch order items without FK join (schema cache issue on Vercel)
    const { data: items } = await supabase
      .from("order_items")
      .select("id, product_id, quantity, total, product_name, unit_price")
      .eq("order_id", order.id);

    // Fetch product names separately
    if (items && items.length > 0) {
      const productIds = items.map((i: { product_id: string }) => i.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      const productMap: Record<string, string> = {};
      if (products) {
        for (const p of products) {
          productMap[p.id] = p.name || "Unknown";
        }
      }

      const enrichedItems = items.map((item: { product_id: string;[key: string]: unknown }) => ({
        ...item,
        product_name: productMap[item.product_id] || "Unknown",
      }));

      setSelectedOrder({ ...order, order_items: enrichedItems as OrderItem[] });
    } else {
      setSelectedOrder({ ...order, order_items: [] });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    setUpdatingStatus(false);

    if (error) {
      showToast(`Failed to update status: ${error.message}`, "error");
    } else {
      showToast(`Order status updated to ${newStatus}!`, "success");
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    paymentStatus: string;
    customerName: string;
    customerEmail: string;
    billingAddress: string | null;
    shippingAddress: string | null;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    lineItems: { index: number; description: string; sku: string; quantity: number; unitPrice: string; total: string }[];
    businessName: string;
    businessAddress: string;
    businessEmail: string;
    businessPhone: string;
  }

  const openInvoice = async (order: Order) => {
    setInvoiceLoading(true);
    setShowInvoice(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/invoice`);
      if (!res.ok) {
        showToast("Failed to load invoice", "error");
        setShowInvoice(false);
        return;
      }
      // The API returns HTML — for the modal component, fetch structured data
      // We fetch from the API and parse the HTML to extract invoice data
      const html = await res.text();
      // Parse invoice number from HTML
      const invMatch = html.match(/# <strong>([^<]+)<\/strong>/);
      const issueMatch = html.match(/Issue Date: <strong>([^<]+)<\/strong>/);
      const dueMatch = html.match(/Due Date: <strong>([^<]+)<\/strong>/);
      const statusMatch = html.match(/class="payment-badge">([^<]+)<\/div>/);
      const invoiceNumber = invMatch ? invMatch[1] : `INV-${order.id.slice(0, 8).toUpperCase()}`;
      const issueDate = issueMatch ? issueMatch[1] : formatDate(order.created_at);
      const dueDate = dueMatch ? dueMatch[1] : formatDate(new Date(Date.now() + 30 * 86400000).toISOString());
      const paymentStatus = statusMatch ? statusMatch[1].toLowerCase() : order.status;
      const lineItemMatches = html.matchAll(/<tr>[\s\S]*?<td>(\d+)<\/td>[\s\S]*?<div class="item-desc">([^<]+)<\/div>[\s\S]*?<td>([^<]*)<\/td>[\s\S]*?<td>(\d+)<\/td>[\s\S]*?<td>([^<]+)<\/td>[\s\S]*?<td>([^<]+)<\/td>[\s\S]*?<\/tr>/g);
      const lineItems: InvoiceData["lineItems"] = [];
      for (const m of lineItemMatches) {
        lineItems.push({
          index: parseInt(m[1]),
          description: m[2],
          sku: m[3] || "—",
          quantity: parseInt(m[4]),
          unitPrice: m[5].trim(),
          total: m[6].trim(),
        });
      }
      const invoiceData: InvoiceData = {
        invoiceNumber,
        issueDate,
        dueDate,
        paymentStatus,
        customerName: (order as Order & { profile_name?: string | null }).profile_name || "Customer",
        customerEmail: (order as Order & { profile_email?: string | null }).profile_email || "",
        billingAddress: null,
        shippingAddress: order.shipping_address,
        subtotal: order.subtotal || 0,
        tax: 0,
        shippingCost: 0,
        total: order.subtotal || 0,
        lineItems,
        businessName: "HERMES",
        businessAddress: "123 Commerce Street, Suite 100, New York, NY 10001",
        businessEmail: "billing@hermes.com",
        businessPhone: "+1 (555) 123-4567",
      };
      setInvoiceData(invoiceData);
    } catch {
      showToast("Failed to load invoice", "error");
      setShowInvoice(false);
    }
    setInvoiceLoading(false);
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>Orders</h1>
          <p style={{ color: "#6B6B67", margin: 0 }}>{orders.length} orders</p>
        </div>
      </div>

      {/* Status Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          onClick={() => setStatusFilter("all")}
          style={{
            padding: "8px 16px", borderRadius: "8px", border: "1px solid",
            borderColor: statusFilter === "all" ? "#3b82f6" : "#E5E5E0",
            background: statusFilter === "all" ? "rgba(59,130,246,0.1)" : "transparent",
            color: statusFilter === "all" ? "#3b82f6" : "#6B6B67",
            fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          All Orders
        </button>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: "8px 16px", borderRadius: "8px", border: "1px solid",
              borderColor: statusFilter === status ? STATUS_STYLES[status].color : "#E5E5E0",
              background: statusFilter === status ? STATUS_STYLES[status].bg : "transparent",
              color: statusFilter === status ? STATUS_STYLES[status].color : "#6B6B67",
              fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.15s ease",
              textTransform: "capitalize"
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "white", border: "1px solid #E5E5E0",
        borderRadius: "12px", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#6B6B67" }}>
            No orders found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E5E0" }}>
                  {["Order ID", "Customer", "Date", "Total", "Status", "Tracking", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "14px 16px", textAlign: "left", fontSize: "12px",
                      color: "#6B6B67", fontWeight: "600",
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #E5E5E0" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "13px", fontFamily: "monospace", color: "#141413",
                          background: "#F4F4F1", padding: "4px 8px",
                          borderRadius: "4px"
                        }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", color: "#141413", fontWeight: "500" }}>
                          {order.profile_name || "Guest"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6B6B67" }}>
                          {order.profile_email || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6B6B67" }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#141413" }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingStatus}
                          style={{
                            padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                            border: "1px solid", borderColor: statusStyle.border,
                            background: statusStyle.bg, color: statusStyle.color,
                            cursor: updatingStatus ? "not-allowed" : "pointer",
                            outline: "none", textTransform: "capitalize", appearance: "auto"
                          }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ background: "#FAFAF8" }}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {order.tracking_number ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#141413", background: "#F4F4F1", padding: "2px 6px", borderRadius: "3px" }}>
                              {order.tracking_number.slice(0, 18)}{order.tracking_number.length > 18 ? "…" : ""}
                            </span>
                            <a
                              href={`/track/${order.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "11px", color: "#3b82f6", textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              ↗ View
                            </a>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#ABAB9A" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => viewOrderDetails(order)} style={{
                          padding: "6px 12px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "transparent", color: "#141413", fontSize: "12px",
                          cursor: "pointer", transition: "all 0.15s ease"
                        }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: "20px"
        }}
        onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div style={{
            background: "white", border: "1px solid #E5E5E0",
            borderRadius: "12px", width: "100%", maxWidth: "700px", maxHeight: "90vh",
            overflow: "auto"
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #E5E5E0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "sticky", top: 0, background: "white", zIndex: 10
            }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#141413", margin: "0 0 4px" }}>
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <p style={{ fontSize: "13px", color: "#6B6B67", margin: 0 }}>
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => openInvoice(selectedOrder)} style={{
                  padding: "8px 16px", borderRadius: "6px", border: "1px solid #E5E5E0",
                  background: "transparent", color: "#141413", fontSize: "12px",
                  cursor: "pointer", transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  <FileText size={14} /> Invoice
                </button>
                <button onClick={() => setSelectedOrder(null)} style={{
                padding: "8px", border: "none", background: "transparent",
                color: "#6B6B67", cursor: "pointer", fontSize: "18px"
              }}>✕</button>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Status & Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={{
                  background: "#F4F4F1", borderRadius: "8px", padding: "16px"
                }}>
                  <div style={{ fontSize: "12px", color: "#6B6B67", marginBottom: "8px", fontWeight: "600" }}>
                    STATUS
                  </div>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: "600",
                      border: "1px solid", background: STATUS_STYLES[selectedOrder.status]?.bg || "transparent",
                      borderColor: STATUS_STYLES[selectedOrder.status]?.border || "#E5E5E0",
                      color: STATUS_STYLES[selectedOrder.status]?.color || "#141413",
                      cursor: updatingStatus ? "not-allowed" : "pointer", outline: "none", textTransform: "capitalize"
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ background: "#FAFAF8" }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{
                  background: "#F4F4F1", borderRadius: "8px", padding: "16px"
                }}>
                  <div style={{ fontSize: "12px", color: "#6B6B67", marginBottom: "8px", fontWeight: "600" }}>
                    ORDER TOTAL
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#141413" }}>
                    {formatCurrency(selectedOrder.total)}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#141413", margin: "0 0 12px" }}>
                  Customer Information
                </h3>
                <div style={{
                  background: "#F4F4F1", borderRadius: "8px", padding: "16px"
                }}>
                  <div style={{ fontSize: "14px", color: "#141413", fontWeight: "500" }}>
                    {(selectedOrder as Order & { profile_name?: string | null }).profile_name || "Guest"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B6B67" }}>
                    {(selectedOrder as Order & { profile_email?: string | null }).profile_email || "—"}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#141413", margin: "0 0 12px" }}>
                  Order Items
                </h3>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <div style={{ border: "1px solid #E5E5E0", borderRadius: "8px", overflow: "hidden" }}>
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={item.id} style={{
                        padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: "12px",
                        borderBottom: index < selectedOrder.order_items!.length - 1 ? "1px solid #E5E5E0" : "none"
                      }}>
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "6px",
                          background: "#F4F4F1", display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}><Package size={20} /></div>
                        <div style={{ flex: "1" }}>
                          <div style={{ fontSize: "14px", color: "#141413", fontWeight: "500" }}>
                            {item.product_name || "Unknown Product"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6B6B67" }}>
                            Qty: {item.quantity} × {formatCurrency(item.unit_price ?? ((item.total ?? 0) / item.quantity))}
                          </div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#141413" }}>
                          {formatCurrency((item.total ?? 0))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: "24px", textAlign: "center", color: "#6B6B67",
                    background: "#F4F4F1", borderRadius: "8px"
                  }}>
                    No items found for this order
                  </div>
                )}
              </div>

              {/* Addresses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Shipping Address", value: selectedOrder.shipping_address },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#141413", margin: "0 0 8px" }}>
                      {label}
                    </h3>
                    <div style={{
                      padding: "12px", background: "#F4F4F1", borderRadius: "8px",
                      fontSize: "13px", color: "#6B6B67", minHeight: "60px"
                    }}>
                      {value || "Not provided"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Info */}
              {selectedOrder.tracking_number && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#141413", margin: "0 0 12px" }}>
                    Tracking
                  </h3>
                  <div style={{
                    background: "#F4F4F1", borderRadius: "8px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
                  }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#6B6B67", marginBottom: "4px" }}>Tracking Number</div>
                      <div style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: "600", color: "#141413" }}>
                        {selectedOrder.tracking_number}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          const link = selectedOrder.tracking_link || `https://next-hermes.vercel.app/track/${selectedOrder.tracking_number}`;
                          navigator.clipboard.writeText(link);
                          showToast("Tracking link copied!", "success");
                        }}
                        style={{
                          padding: "6px 14px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "white", color: "#141413", fontSize: "12px", cursor: "pointer"
                        }}
                      >
                        Copy Link
                      </button>
                      <a
                        href={`/track/${selectedOrder.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "6px 14px", borderRadius: "6px", border: "1px solid #E5E5E0",
                          background: "white", color: "#141413", fontSize: "12px",
                          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px"
                        }}
                      >
                        <Package size={12} /> Track Page ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div style={{ marginTop: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#141413", margin: "0 0 8px" }}>
                    Order Notes
                  </h3>
                  <div style={{
                    padding: "12px", background: "#F4F4F1", borderRadius: "8px",
                    fontSize: "13px", color: "#6B6B67"
                  }}>
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && (
        invoiceLoading || !invoiceData ? (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
          }}>
            <div style={{
              background: "white", border: "1px solid #E5E5E0", borderRadius: "12px",
              padding: "48px", textAlign: "center", color: "#6B6B67"
            }}>
              Loading invoice...
            </div>
          </div>
        ) : (
          <OrderInvoice
            data={invoiceData}
            onClose={() => { setShowInvoice(false); setInvoiceData(null); }}
          />
        )
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          padding: "14px 20px", borderRadius: "8px",
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "#fff", fontSize: "14px", fontWeight: "500",
          zIndex: 200, animation: "slideIn 0.3s ease"
        }}>
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
