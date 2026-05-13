import { createRouteHandlerClient } from "@/utils/supabase/lib";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  // Fetch order items — no FK join
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantity, price")
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch product names separately — no FK join
  const productIds = [...new Set((data || []).map((i) => i.product_id).filter(Boolean))];
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, category_id")
    .in("id", productIds);

  // Fetch category names separately
  const categoryIds = [...new Set((products || []).map((p) => p.category_id).filter(Boolean))];
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);

  const productMap: Record<string, { name: string; price: number; category_id: string }> = {};
  if (products) {
    for (const p of products) {
      productMap[p.id] = { name: p.name || "Unknown", price: p.price || 0, category_id: p.category_id || "" };
    }
  }

  const categoryMap: Record<string, string> = {};
  if (categories) {
    for (const c of categories) {
      categoryMap[c.id] = c.name || "Uncategorized";
    }
  }

  const productSales: Record<string, { product_id: string; name: string; price: number; category: string; units_sold: number; revenue: number }> = {};

  for (const item of data || []) {
    const product = productMap[item.product_id] || { name: "Unknown", price: 0, category_id: "" };
    const category = categoryMap[product.category_id] || "Uncategorized";
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = {
        product_id: item.product_id,
        name: product.name,
        price: product.price,
        category,
        units_sold: 0,
        revenue: 0,
      };
    }
    productSales[item.product_id].units_sold += item.quantity || 0;
    productSales[item.product_id].revenue += (item.quantity || 0) * product.price;
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.units_sold - a.units_sold)
    .slice(0, limit)
    .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

  const categorySales: Record<string, number> = {};
  for (const p of topProducts) {
    categorySales[p.category] = (categorySales[p.category] || 0) + p.revenue;
  }
  const categoryChart = Object.entries(categorySales).map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }));

  return NextResponse.json({ topProducts, categoryChart });
}