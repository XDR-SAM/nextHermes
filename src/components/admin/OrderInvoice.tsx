"use client";

interface InvoiceLineItem {
  index: number;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

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
  lineItems: InvoiceLineItem[];
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
}

interface OrderInvoiceProps {
  data: InvoiceData;
  onClose?: () => void;
}

/**
 * Format a number as USD currency.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const PAYMENT_BADGE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  paid: { bg: "#dcfce7", color: "#16a34a", label: "Paid" },
  pending: { bg: "#fef9c3", color: "#ca8a04", label: "Pending" },
  failed: { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
  refunded: { bg: "#e0e7ff", color: "#4f46e5", label: "Refunded" },
  processing: { bg: "#dbeafe", color: "#2563eb", label: "Processing" },
};

export default function OrderInvoice({ data, onClose }: OrderInvoiceProps) {
  const badge =
    PAYMENT_BADGE_STYLES[data.paymentStatus] || {
      bg: "#f3f4f6",
      color: "#6b7280",
      label: data.paymentStatus || "Unknown",
    };

  const handlePrint = () => window.print();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 200,
        padding: "24px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "840px",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e5e7eb",
            background: "var(--bg-card, #0a0a0a)",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text, #fafafa)" }}>
            Invoice Preview — {data.invoiceNumber}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handlePrint}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid var(--border, #333)",
                background: "transparent",
                color: "var(--text, #fafafa)",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              🖨️ Print
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #333)",
                  background: "transparent",
                  color: "var(--text, #fafafa)",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Invoice body — this prints */}
        <div
          style={{ padding: "48px 40px", background: "#ffffff", color: "#111827" }}
          className="invoice-print-area"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "40px",
              paddingBottom: "28px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            <div>
              <div
                style={{ fontSize: "28px", fontWeight: "800", color: "#111827", letterSpacing: "-0.5px" }}
              >
                {data.businessName}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px", lineHeight: "1.7" }}>
                {data.businessAddress}
                <br />
                {data.businessEmail}
                <br />
                {data.businessPhone}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>
                INVOICE
              </div>
              <div style={{ fontSize: "14px", color: "#374151", marginBottom: "4px" }}>
                # <strong style={{ fontWeight: "700" }}>{data.invoiceNumber}</strong>
              </div>
              <div style={{ fontSize: "14px", color: "#374151", marginBottom: "4px" }}>
                Issue Date: <strong>{data.issueDate}</strong>
              </div>
              <div style={{ fontSize: "14px", color: "#374151", marginBottom: "8px" }}>
                Due Date: <strong>{data.dueDate}</strong>
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: badge.bg,
                  color: badge.color,
                }}
              >
                {badge.label}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              marginBottom: "36px",
            }}
          >
            {[
              { label: "Bill To", value: data.billingAddress || data.shippingAddress },
              { label: "Ship To", value: data.shippingAddress },
            ].map(({ label, value }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7" }}>
                  <strong style={{ color: "#111827", display: "block", marginBottom: "2px" }}>
                    {data.customerName}
                  </strong>
                  <span style={{ display: "block", color: "#6b7280" }}>{data.customerEmail}</span>
                  {value ? (
                    <span style={{ display: "block", whiteSpace: "pre-wrap", marginTop: "4px" }}>
                      {value}
                    </span>
                  ) : (
                    <span style={{ display: "block", color: "#d1d5db" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Line items */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                {["#", "Description", "SKU", "Qty", "Unit Price", "Total"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      textAlign: i >= 4 ? "right" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item) => (
                <tr key={item.index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 12px", fontSize: "14px", color: "#9ca3af" }}>
                    {item.index}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                      {item.description}
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: "12px", color: "#9ca3af" }}>
                    {item.sku || "—"}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: "14px", color: "#374151" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: "14px", color: "#374151", textAlign: "right" }}>
                    {item.unitPrice}
                  </td>
                  <td style={{ padding: "14px 12px", fontSize: "14px", fontWeight: "600", color: "#111827", textAlign: "right" }}>
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
            <table style={{ borderCollapse: "collapse", width: "280px" }}>
              {[
                { label: "Subtotal", value: data.subtotal },
                { label: "Tax", value: data.tax },
                { label: "Shipping", value: data.shippingCost },
              ].map(({ label, value }) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "8px 0",
                      fontSize: "14px",
                      color: "#6b7280",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "8px 0",
                      fontSize: "14px",
                      color: "#374151",
                      textAlign: "right",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {formatCurrency(value)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  style={{
                    padding: "12px 0 0",
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    padding: "12px 0 0",
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#111827",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(data.total)}
                </td>
              </tr>
            </table>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>{data.businessName}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{data.businessAddress}</div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>{data.businessEmail} · {data.businessPhone}</div>
            <div style={{ fontSize: "13px", color: "#374151", marginTop: "8px" }}>Thank you for your business!</div>
          </div>
        </div>
      </div>

      {/* Print stylesheet — hides everything except invoice when printing */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .invoice-print-area,
          .invoice-print-area * { display: block !important; }
          .invoice-print-area {
            padding: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
