import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID or slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select(
        `id, name, slug, description, price, compare_at_price, stock_quantity, is_active, created_at,
        category(id, name, slug),
        brand(id, name),
        primary_image,
        avg_rating,
        images(id, url, alt_text, is_primary),
        variants(id, name, sku, price, stock_quantity, attributes),
        reviews(id, rating, comment, created_at, author:profiles(id, full_name, avatar_url))`
      );

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id);
    }

    const { data: product, error } = await query.single();

    if (error || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
