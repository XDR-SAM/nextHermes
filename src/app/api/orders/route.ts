import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, address, payment_method = "cod" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!address || !address.name || !address.address || !address.city || !address.zip || !address.country) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    // Build shipping address string
    const shippingAddress = `${address.name}${address.phone ? `, ${address.phone}` : ""}, ${address.address}, ${address.city}${address.state ? `, ${address.state}` : ""} ${address.zip}, ${address.country}`;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);

    // Generate tracking number: TRK-{timestamp36}-{random6}
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const trackingNumber = `TRK-${ts}-${rand}`;
    const trackingLink = `https://next-hermes.vercel.app/track/${trackingNumber}`;
    const orderNumber = `ORD-${ts}`;

    // Insert order — try with new columns first, fall back to base columns if they don't exist
    let order: { id: string } | null = null;
    let orderError: { message: string } | null = null;

    // Attempt 1: with tracking columns (works after migration)
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal,
        shipping_address: shippingAddress,
        notes: `Payment: ${payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}`,
        tracking_number: trackingNumber,
        tracking_link: trackingLink,
        order_number: orderNumber,
      })
      .select("id")
      .single();

    order = data;
    orderError = error;

    // Attempt 2: fallback without new columns (for pre-migration compatibility)
    if (orderError) {
      const { data: data2, error: error2 } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          subtotal,
          shipping_address: shippingAddress,
          notes: `Payment: ${payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}`,
        })
        .select("id")
        .single();

      order = data2;
      orderError = error2;
    }

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order" }, { status: 500 });
    }

    // Insert order items — with product_name and unit_price (fall back to total-only if not migrated)
    const orderItems = items.map((item: { id: string; name: string; price: number; quantity: number; image?: string }) => ({
      order_id: order!.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      total: item.price * item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      tracking_number: trackingNumber,
      tracking_link: trackingLink,
      order_number: orderNumber,
      total: subtotal,
      payment_method,
    }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}