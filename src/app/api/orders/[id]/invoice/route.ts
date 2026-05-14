import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return { authorized: false, status: 403, error: "Forbidden: Admin access required" };
  }

  return { authorized: true, userId: user.id, role: profile.role as UserRole };
}

function generateInvoiceNumber(orderId: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const sequence = orderId.replace(/-/g, "").slice(-5).toUpperCase();
  return `INV-${year}${month}${day}-${sequence}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
  }).format(amount);
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(cookieStore);
    const auth = await verifyAdmin(supabase);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // 1. Fetch order — flat columns only, no FK joins
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, subtotal, user_id, shipping_address, billing_address, created_at")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch order items — flat columns only
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id, id, quantity, total, product_id")
      .eq("order_id", id);

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "No items found for this order" }, { status: 404 });
    }

    // 3. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();

    // 4. Build line items
    const lineItems = orderItems.map((item, index) => {
      const lineTotal = Number(item.quantity) * (item.quantity > 0 ? Number(item.total) / Number(item.quantity) : 0);
      const unitPrice = item.quantity > 0 ? Number(item.total) / Number(item.quantity) : 0;
      return {
        index: index + 1,
        description: `Product ${item.product_id?.slice(0, 6) || item.id.slice(0, 6)}`,
        sku: "—",
        quantity: item.quantity,
        unitPrice: formatCurrency(unitPrice),
        total: formatCurrency(Number(item.total)),
      };
    });

    // 5. Payment status badge colors — use order status as payment proxy
    const paymentStatus = order.status;
    const paymentStatusLabel = paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : "Unknown";

    const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
      paid: { bg: "#dcfce7", color: "#16a34a" },
      pending: { bg: "#fef9c3", color: "#ca8a04" },
      failed: { bg: "#fee2e2", color: "#dc2626" },
      refunded: { bg: "#e0e7ff", color: "#4f46e5" },
      processing: { bg: "#dbeafe", color: "#2563eb" },
    };
    const badgeColors = BADGE_COLORS[paymentStatus] || { bg: "#f3f4f6", color: "#6b7280" };

    const invoiceNumber = generateInvoiceNumber(order.id, order.created_at);
    const issueDate = formatDate(order.created_at);
    const dueDate = formatDate(new Date(new Date(order.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

    const subtotal = order.subtotal || 0;
    const tax = 0;
    const shipping = 0;
    const total = subtotal;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #111827; background: #ffffff; line-height: 1.5; }
    .invoice-wrap { max-width: 800px; margin: 0 auto; padding: 48px 40px; }
    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 2px solid #e5e7eb; }
    .business-name { font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
    .business-info { font-size: 13px; color: #6b7280; margin-top: 8px; line-height: 1.7; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 12px; }
    .invoice-number { font-size: 14px; color: #374151; margin-bottom: 4px; }
    .invoice-number strong { font-weight: 700; }
    .payment-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: ${badgeColors.bg}; color: ${badgeColors.color}; margin-top: 8px; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .address-block h3 { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .address-block p { font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    .items-table thead tr { border-bottom: 2px solid #e5e7eb; }
    .items-table th { padding: 10px 12px; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
    .items-table th:last-child, .items-table td:last-child { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #f3f4f6; }
    .items-table td { padding: 14px 12px; font-size: 14px; color: #374151; vertical-align: top; }
    .item-desc { font-weight: 600; color: #111827; }
    .item-sku { font-size: 12px; color: #9ca3af; margin-top: 2px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 48px; }
    .totals-table { width: 280px; border-collapse: collapse; }
    .totals-table tr td { padding: 8px 0; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .totals-table tr td:last-child { text-align: right; }
    .totals-table .label { color: #6b7280; }
    .totals-table .grand-total td { padding-top: 12px; font-size: 18px; font-weight: 800; color: #111827; border-bottom: none; }
    .invoice-footer { border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; }
    .footer-note { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
    .footer-business { font-size: 15px; font-weight: 700; color: #111827; }
    .footer-thank { font-size: 13px; color: #374151; margin-top: 8px; }
    .print-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 32px; }
    .btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s; }
    .btn:hover { opacity: 0.85; }
    .btn-print { background: #111827; color: #ffffff; }
    .btn-download { background: #e5e7eb; color: #374151; }
    @media print { .print-actions { display: none !important; } body { background: #ffffff; } .invoice-wrap { padding: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <div class="invoice-wrap">
    <div class="print-actions">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print Invoice</button>
      <button class="btn btn-download" onclick="window.print()">📄 Download PDF</button>
    </div>
    <div class="invoice-header">
      <div>
        <div class="business-name">HERMES</div>
        <div class="business-info">123 Commerce Street<br />Suite 100, New York, NY 10001<br />billing@hermes.com<br />+1 (555) 123-4567</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number"># <strong>${escapeHtml(invoiceNumber)}</strong></div>
        <div class="invoice-number">Issue Date: <strong>${escapeHtml(issueDate)}</strong></div>
        <div class="invoice-number">Due Date: <strong>${escapeHtml(dueDate)}</strong></div>
        <div class="payment-badge">${escapeHtml(paymentStatusLabel)}</div>
      </div>
    </div>
    <div class="addresses">
      <div class="address-block">
        <h3>Bill To</h3>
        <p>${escapeHtml(profile?.full_name) || "Customer"}</p>
        <p>${escapeHtml(profile?.email) || ""}</p>
        ${order.billing_address ? `<p>${escapeHtml(order.billing_address)}</p>` : (order.shipping_address ? `<p>${escapeHtml(order.shipping_address)}</p>` : "<p>—</p>")}
      </div>
      <div class="address-block">
        <h3>Ship To</h3>
        <p>${escapeHtml(profile?.full_name) || "Customer"}</p>
        ${order.shipping_address ? `<p>${escapeHtml(order.shipping_address)}</p>` : "<p>—</p>"}
      </div>
    </div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th>Description</th>
          <th style="width:100px">SKU</th>
          <th style="width:70px">Qty</th>
          <th style="width:120px">Unit Price</th>
          <th style="width:120px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems.map((item) => `
        <tr>
          <td>${item.index}</td>
          <td><div class="item-desc">${item.description}</div><div class="item-sku">${item.sku}</div></td>
          <td>${item.sku}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice}</td>
          <td>${item.total}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <table class="totals-table">
        <tr><td class="label">Subtotal</td><td>${formatCurrency(subtotal)}</td></tr>
        <tr><td class="label">Tax</td><td>${formatCurrency(tax)}</td></tr>
        <tr><td class="label">Shipping</td><td>${formatCurrency(shipping)}</td></tr>
        <tr class="grand-total"><td>Grand Total</td><td>${formatCurrency(total)}</td></tr>
      </table>
    </div>
    <div class="invoice-footer">
      <p class="footer-note">Questions about this invoice? Contact us at billing@hermes.com</p>
      <p class="footer-business">HERMES</p>
      <p class="footer-thank">Thank you for your business!</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("Invoice error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}