import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = await createServiceClient();

  const { data, error } = await svc
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const svc = await createServiceClient();

  const { data, error } = await svc
    .from("product_variants")
    .insert({ ...body, product_id: id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const svc = await createServiceClient();

  const variantId = body.id;
  const { id: _id, product_id: _pid, ...updateData } = body;

  const { data, error } = await svc
    .from("product_variants")
    .update(updateData)
    .eq("id", variantId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = await createServiceClient();

  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");

  if (!variantId) return NextResponse.json({ error: "variantId required" }, { status: 400 });

  const { error } = await svc
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}