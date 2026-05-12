import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
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
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `id, name, slug, description, price, compare_at_price, stock_quantity, is_active, created_at, updated_at,
        category(id, name, slug),
        brand(id, name),
        primary_image,
        avg_rating,
        images(id, url, alt_text)`
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] }, { status: 200 });
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

    const requiredFields = ["name", "slug", "price"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        compare_at_price: body.compare_at_price || null,
        stock_quantity: body.stock_quantity || 0,
        is_active: body.is_active ?? true,
        category_id: body.category_id || null,
        brand_id: body.brand_id || null,
        primary_image: body.primary_image || null,
        images: body.images || [],
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
