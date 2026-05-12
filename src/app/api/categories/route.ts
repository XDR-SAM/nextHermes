import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from("categories")
      .select(
        `id, name, slug, description, image_url, is_active, created_at,
        product_count:products(count)`
      )
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const formatted = (categories || []).map((cat: Record<string, unknown>) => ({
      ...cat,
      product_count: Array.isArray(cat.product_count) && cat.product_count[0]
        ? (cat.product_count[0] as Record<string, unknown>).count
        : 0,
    }));

    return NextResponse.json(
      { categories: formatted },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
