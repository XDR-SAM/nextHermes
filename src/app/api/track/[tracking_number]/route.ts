import { NextRequest, NextResponse } from "next/server";
import { createClient as createBrowserClient } from "@/utils/supabase/client";

// GET /api/track/{tracking_number} — public endpoint, no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tracking_number: string }> }
) {
  try {
    const { tracking_number } = await params;

    if (!tracking_number || tracking_number.length < 5) {
      return NextResponse.json({ error: "Invalid tracking number" }, { status: 400 });
    }

    const supabase = createBrowserClient();

    // Try new columns first (tracking_number, tracking_link)
    let { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, status, tracking_number, tracking_link, order_number, invoice_number, subtotal, shipping_address, created_at, user_id"
      )
      .eq("tracking_number", tracking_number)
      .single();

    // Fallback: search by order_number or invoice_number
    if (error || !order) {
      const fallback = await supabase
        .from("orders")
        .select(
          "id, status, tracking_number, tracking_link, order_number, invoice_number, subtotal, shipping_address, created_at, user_id"
        )
        .or(`order_number.eq.${tracking_number},invoice_number.eq.${tracking_number}`)
        .single();

      if (!fallback.error && fallback.data) {
        order = fallback.data;
      }
    }

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("id, quantity, total, unit_price, product_name, product_id")
      .eq("order_id", order.id);

    // Build tracking timeline
    const timeline = buildTrackingTimeline(order.status, order.created_at);

    return NextResponse.json({
      tracking_number: order.tracking_number || tracking_number,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      invoice_number: order.invoice_number || null,
      status: order.status,
      tracking_link: order.tracking_link || `https://next-hermes.vercel.app/track/${tracking_number}`,
      timeline,
      items: (items || []).map((item: { product_name?: string | null; product_id?: string; id: string; quantity: number; total: number | null; unit_price?: number | null }) => ({
        name: item.product_name || `Product ${item.product_id?.slice(0, 6) || item.id.slice(0, 6)}`,
        quantity: item.quantity,
        unit_price: item.unit_price || (item.quantity > 0 ? Number(item.total) / item.quantity : 0),
        total: Number(item.total),
      })),
      subtotal: Number(order.subtotal),
      shipping_address: order.shipping_address,
      placed_at: order.created_at,
    });
  } catch (err) {
    console.error("Track API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildTrackingTimeline(status: string, createdAt: string) {
  const stages = [
    { key: "pending", label: "Order Placed", description: "Your order has been received and is awaiting processing." },
    { key: "confirmed", label: "Order Confirmed", description: "Your order has been confirmed and is being prepared." },
    { key: "processing", label: "Processing", description: "Your items are being packed and prepared for shipment." },
    { key: "shipped", label: "Shipped", description: "Your order has been handed over to the carrier." },
    { key: "out_for_delivery", label: "Out for Delivery", description: "The package is on its way to your address." },
    { key: "delivered", label: "Delivered", description: "Your order has been delivered." },
  ];

  if (status === "cancelled") {
    return [
      {
        key: "cancelled",
        label: "Order Cancelled",
        description: "This order has been cancelled.",
        completed_at: createdAt,
        is_active: false,
        is_cancelled: true,
      },
    ];
  }

  const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  const currentIndex = statusOrder.indexOf(status);

  return stages.map((stage, index) => {
    const isCompleted = currentIndex >= index;
    const isActive = currentIndex === index;
    // Spread timestamps based on status progression (just for UI — no real timestamps per stage)
    const baseDate = new Date(createdAt);
    baseDate.setHours(baseDate.getHours() + index * 4);
    return {
      ...stage,
      completed_at: isCompleted ? baseDate.toISOString() : null,
      is_active: isActive,
      is_completed: isCompleted && !isActive,
      is_cancelled: false,
    };
  });
}