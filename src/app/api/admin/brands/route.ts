import { NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";

export async function GET() {
  const svc = await createServiceClient();
  const { data, error } = await svc
    .from("brands")
    .select("id, name, slug, is_active")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}