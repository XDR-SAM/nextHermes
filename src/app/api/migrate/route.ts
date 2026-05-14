import { NextResponse } from "next/server";

// Run database migrations to add tracking columns to orders table
// POST /api/migrate
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    return NextResponse.json({ error: "Could not parse project ref from URL" }, { status: 500 });
  }

  const sql = `
    -- Add tracking columns to orders
    DO $$ BEGIN
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
    EXCEPTION WHEN others THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_link TEXT;
    EXCEPTION WHEN others THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
    EXCEPTION WHEN others THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;
    EXCEPTION WHEN others THEN NULL; END $$;

    -- Add product_name, unit_price to order_items
    DO $$ BEGIN
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
    EXCEPTION WHEN others THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC;
    EXCEPTION WHEN others THEN NULL; END $$;

    -- Seed order_number from id for existing orders
    UPDATE orders SET order_number = 'ORD-' || substr(id::text, 1, 8) WHERE order_number IS NULL;
    UPDATE orders SET invoice_number = 'INV-' || to_char(created_at, 'YYYYMMDD') || '-' || substr(id::text, 1, 5) WHERE invoice_number IS NULL;

    -- Compute unit_price from total/quantity for existing order_items
    UPDATE order_items SET unit_price = CASE WHEN quantity > 0 THEN total / quantity ELSE 0 END WHERE unit_price IS NULL;
  `;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({
      error: "Migration failed via Supabase Management API",
      detail: err,
      manual_sql: [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_link TEXT;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;",
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;",
        "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC;",
        "UPDATE orders SET order_number = 'ORD-' || substr(id::text, 1, 8) WHERE order_number IS NULL;",
        "UPDATE orders SET invoice_number = 'INV-' || to_char(created_at, 'YYYYMMDD') || '-' || substr(id::text, 1, 5) WHERE invoice_number IS NULL;",
        "UPDATE order_items SET unit_price = CASE WHEN quantity > 0 THEN total / quantity ELSE 0 END WHERE unit_price IS NULL;",
      ],
    }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ success: true, message: "Migration complete", data });
}