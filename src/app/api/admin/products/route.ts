import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/utils/supabase/server";
import type { UserRole } from "@/lib/types";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAdmin(supabase);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const svc = await createServiceClient();

    // Get products
    const { data: products, error: productsError } = await svc
      .from("products")
      .select("id, name, slug, description, short_description, price, original_price, sku, stock_quantity, stock_status, category_id, brand_id, is_featured, is_trending, is_active, created_at, updated_at, metadata")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    // Get categories for names
    const { data: categories } = await svc
      .from("categories")
      .select("id, name")
      .order("name");

    // Get brands for names
    const { data: brands } = await svc
      .from("brands")
      .select("id, name")
      .order("name");

    const catMap = new Map((categories || []).map(c => [c.id, c.name]));
    const brandMap = new Map((brands || []).map(b => [b.id, b.name]));

    const productsWithNames = (products || []).map(p => ({
      ...p,
      category_name: p.category_id ? (catMap.get(p.category_id) || null) : null,
      brand_name: p.brand_id ? (brandMap.get(p.brand_id) || null) : null,
    }));

    return NextResponse.json({ products: productsWithNames }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAdmin(supabase);

    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Missing required field: name or price" }, { status: 400 });
    }

    const svc = await createServiceClient();

    const { data: product, error } = await svc
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        description: body.description || null,
        short_description: body.short_description || null,
        price: body.price,
        original_price: body.original_price || null,
        sku: body.sku || null,
        stock_quantity: body.stock_quantity || 0,
        stock_status: body.stock_status || "in_stock",
        category_id: body.category_id || null,
        brand_id: body.brand_id || null,
        is_featured: body.is_featured ?? false,
        is_trending: body.is_trending ?? false,
        is_active: body.is_active ?? true,
        metadata: body.metadata || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}