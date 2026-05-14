import { NextRequest, NextResponse } from "next/server";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Fetch order by tracking_number
    let { data: order, error } = await fetch(
      `${supabaseUrl}/rest/v1/orders?select=id,order_number,status,total_amount,subtotal,shipping_address,tracking_number,tracking_link,created_at&tracking_number=eq.${encodeURIComponent(tracking_number)}&limit=1`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    ).then(r => r.json()) as any;

    // Fallback: search by order_number
    if (!order || order.length === 0) {
      const fallback = await fetch(
        `${supabaseUrl}/rest/v1/orders?select=id,order_number,status,total_amount,subtotal,shipping_address,tracking_number,tracking_link,created_at&order_number=eq.${encodeURIComponent(tracking_number)}&limit=1`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      ).then(r => r.json()) as { data: any[] };
      order = fallback || [];
    }

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const o = order[0];

    // Fetch order items
    const items = await fetch(
      `${supabaseUrl}/rest/v1/order_items?select=id,name,price,quantity,total,product_id&order_id=eq.${o.id}`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    ).then(r => r.json()) as any[] || [];

    // Build tracking timeline
    const timeline = buildTrackingTimeline(o.status, o.created_at);

    return NextResponse.json({
      tracking_number: o.tracking_number || tracking_number,
      order_number: o.order_number || `ORD-${o.id.slice(0, 8).toUpperCase()}`,
      status: o.status,
      tracking_link: o.tracking_link || `https://next-hermes.vercel.app/track/${tracking_number}`,
      timeline,
      items: items.map((item: { name?: string; product_id?: string; id: string; quantity: number; total: number | null; price: number | null }) => ({
        name: item.name || `Product ${item.product_id?.slice(0, 6) || item.id.slice(0, 6)}`,
        quantity: item.quantity,
        unit_price: Number(item.price) || 0,
        total: Number(item.total) || 0,
      })),
      subtotal: Number(o.subtotal) || 0,
      total: Number(o.total_amount) || 0,
      shipping_address: o.shipping_address,
      placed_at: o.created_at,
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
    return [{
      key: "cancelled", label: "Order Cancelled",
      description: "This order has been cancelled.",
      completed_at: createdAt, is_active: false,
      is_completed: false, is_cancelled: true,
    }];
  }

  const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  const currentIndex = statusOrder.indexOf(status);

  return stages.map((stage, index) => {
    const isCompleted = currentIndex >= index;
    const isActive = currentIndex === index;
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