import { NextResponse } from "next/server";

// Seed products — uses service role at runtime (available on Vercel)
// Run once by hitting this endpoint, then delete or protect it
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured for seeding" }, { status: 500 });
  }

  // First get categories to get IDs
  const catRes = await fetch(
    `${supabaseUrl}/rest/v1/categories?select=id,name&order=name.asc`,
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: "no-store",
    }
  );

  if (!catRes.ok) {
    return NextResponse.json({ error: `Failed to get categories: ${await catRes.text()}` }, { status: 502 });
  }

  const categories: { id: string; name: string }[] = await catRes.json();
  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.name.toLowerCase()] = c.id; });

  const PRODUCTS = [
    // ── Electronics ──────────────────────────────────────────────────
    {
      name: "AirPods Pro 3rd Gen",
      slug: "airpods-pro-3rd-gen",
      description: "Next-generation active noise cancellation with transparency mode, adaptive audio, and up to 6 hours of listening time. USB-C charging case with built-in speaker and lanyard loop.",
      price: 249,
      stock_quantity: 45,
      is_active: true,
      avg_rating: 4.8,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },
    {
      name: "MacBook Air M4 15\"",
      slug: "macbook-air-m4-15",
      description: "Supercharged by the M4 chip with a 15-inch Liquid Retina display, up to 18 hours of battery life, and a fanless design. Perfect for work, creativity, and everything in between.",
      price: 1299,
      stock_quantity: 20,
      is_active: true,
      avg_rating: 4.9,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },
    {
      name: "iPhone 16 Pro Max",
      slug: "iphone-16-pro-max",
      description: "Titanium design with the A18 Pro chip, a game-changing Camera Control, 48MP Fusion camera, and the longest battery life ever in an iPhone. Display: 6.9\" Super Retina XDR.",
      price: 1199,
      stock_quantity: 35,
      is_active: true,
      avg_rating: 4.9,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      slug: "samsung-galaxy-s25-ultra",
      description: "6.8\" QHD+ Dynamic AMOLED 2X display, 200MP camera system, S Pen built in, Snapdragon 8 Elite processor, and Galaxy AI built in. The ultimate Android flagship.",
      price: 1099,
      stock_quantity: 28,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },
    {
      name: "Sony WH-1000XM6",
      slug: "sony-wh-1000xm6",
      description: "Industry-leading noise cancellation with 8 microphones, 30-hour battery, hi-res audio certified, speak-to-chat, and multipoint connection. The gold standard in ANC headphones.",
      price: 399,
      stock_quantity: 40,
      is_active: true,
      avg_rating: 4.8,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },
    {
      name: "Apple Watch Ultra 3",
      slug: "apple-watch-ultra-3",
      description: "The most rugged and capable Apple Watch ever. 49mm titanium case, precision dual-frequency GPS, up to 36 hours of battery, and 86-decibel siren.",
      price: 849,
      stock_quantity: 18,
      is_active: true,
      avg_rating: 4.9,
      category_id: catMap["electronics"] || categories[0]?.id || null,
    },

    // ── Clothing ─────────────────────────────────────────────────────
    {
      name: "Premium Merino Wool Crew Neck",
      slug: "premium-merino-wool-crew-neck",
      description: "Ultra-soft 100% Australian merino wool in a classic crew neck fit. Temperature-regulating, odor-resistant, and machine washable. Available in 8 colors.",
      price: 128,
      stock_quantity: 60,
      is_active: true,
      avg_rating: 4.6,
      category_id: catMap["clothing"] || categories[0]?.id || null,
    },
    {
      name: "Tailored Slim-Fit Chinos",
      slug: "tailored-slim-fit-chinos",
      description: "Premium cotton twill with just the right amount of stretch. Tailored through the hip and thigh with a narrow leg. Perfect for work or weekend. 6 colors.",
      price: 89,
      stock_quantity: 80,
      is_active: true,
      avg_rating: 4.5,
      category_id: catMap["clothing"] || categories[0]?.id || null,
    },
    {
      name: "Cashmere Blend Overcoat",
      slug: "cashmere-blend-overcoat",
      description: "Luxurious 80% cashmere, 20% merino wool blend. Double-breasted with horn buttons, fully lined, and cut to hit at the knee. An investment piece.",
      price: 595,
      stock_quantity: 15,
      is_active: true,
      avg_rating: 4.8,
      category_id: catMap["clothing"] || categories[0]?.id || null,
    },
    {
      name: "Organic Cotton Oxford Shirt",
      slug: "organic-cotton-oxford-shirt",
      description: "Button-down collar oxford in 100% GOTS-certified organic cotton. Regular fit with a soft, lived-in feel from day one. White, light blue, and sage.",
      price: 75,
      stock_quantity: 90,
      is_active: true,
      avg_rating: 4.4,
      category_id: catMap["clothing"] || categories[0]?.id || null,
    },
    {
      name: "Heavyweight French Terry Hoodie",
      slug: "heavyweight-french-terry-hoodie",
      description: "480gsm French terry loopback cotton. Oversized fit, kangaroo pocket, flat drawstrings, and ribbed cuffs. The perfect layer for any season.",
      price: 110,
      stock_quantity: 55,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["clothing"] || categories[0]?.id || null,
    },

    // ── Footwear ────────────────────────────────────────────────────
    {
      name: "Suede Chelsea Boot",
      slug: "suede-chelsea-boot",
      description: "Italian suede upper with an弹性 gore side panel and rubber lug sole. Goodyear welted construction for resoleability. Available in cognac, midnight, and olive.",
      price: 245,
      stock_quantity: 35,
      is_active: true,
      avg_rating: 4.6,
      category_id: catMap["footwear"] || categories[0]?.id || null,
    },
    {
      name: "Leather Chelsea Boot",
      slug: "leather-chelsea-boot",
      description: "Full-grain calfskin leather with a Blake-stitched construction. Sleek silhouette, Cuban heel, and leather sole with rubber insert. Cognac and black.",
      price: 320,
      stock_quantity: 25,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["footwear"] || categories[0]?.id || null,
    },
    {
      name: "Canvas Low-Top Sneaker",
      slug: "canvas-low-top-sneaker",
      description: "Organic canvas upper on a classic vulcanized rubber sole. Minimal branding, cushioned insole, and a timeless low profile. Machine washable.",
      price: 68,
      stock_quantity: 100,
      is_active: true,
      avg_rating: 4.5,
      category_id: catMap["footwear"] || categories[0]?.id || null,
    },
    {
      name: "Running Shoe — CloudFoam",
      slug: "running-shoe-cloudfoam",
      description: "Lightweight mesh upper with CloudFoam midsole for plush cushioning on every stride. Durable rubber outsole with flex grooves. Great for running or everyday wear.",
      price: 95,
      stock_quantity: 70,
      is_active: true,
      avg_rating: 4.4,
      category_id: catMap["footwear"] || categories[0]?.id || null,
    },

    // ── Accessories ─────────────────────────────────────────────────
    {
      name: "Leather Card Wallet",
      slug: "leather-card-wallet",
      description: "Vegetable-tanned Italian leather, 8 card slots, 2 bill compartments, and a coin pocket. Slim profile that fits in any pocket. Ages beautifully with use.",
      price: 85,
      stock_quantity: 50,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["accessories"] || categories[0]?.id || null,
    },
    {
      name: "Cashmere Scarf",
      slug: "cashmere-scarf",
      description: "12-ply Mongolian cashmere, hand-finished fringes. 70cm × 200cm — versatile as a wrap or a shawl. 8 solid colors and 4 seasonal patterns.",
      price: 195,
      stock_quantity: 40,
      is_active: true,
      avg_rating: 4.8,
      category_id: catMap["accessories"] || categories[0]?.id || null,
    },
    {
      name: "Titanium Watch — Minimal",
      slug: "titanium-watch-minimal",
      description: "Grade 5 titanium case, 39mm, sapphire crystal, quartz movement, 100m water resistance. Swiss-made with interchangeable straps.",
      price: 485,
      stock_quantity: 12,
      is_active: true,
      avg_rating: 4.9,
      category_id: catMap["accessories"] || categories[0]?.id || null,
    },
    {
      name: "Leather Tote Bag",
      slug: "leather-tote-bag",
      description: "Full-grain leather tote with hand-stitched handles, magnetic snap closure, and interior zip pocket. Fits a 15\" laptop. Available in tan and black.",
      price: 245,
      stock_quantity: 30,
      is_active: true,
      avg_rating: 4.6,
      category_id: catMap["accessories"] || categories[0]?.id || null,
    },

    // ── Home & Living ───────────────────────────────────────────────
    {
      name: "Linen Duvet Cover Set",
      slug: "linen-duvet-cover-set",
      description: "Pre-washed 100% European flax linen. OEKO-TEX certified, gets softer with every wash. Includes duvet cover and 2 pillow shams. 8 muted colors.",
      price: 185,
      stock_quantity: 40,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["home & living"] || categories[0]?.id || null,
    },
    {
      name: "Hand-Poured Soy Candle",
      slug: "hand-poured-soy-candle",
      description: "100% soy wax, cotton wick, 60+ hour burn time. Scents: Cedar & Sage, Bergamot & Black Tea, Oud & Amber. Amber glass vessel, reusable.",
      price: 42,
      stock_quantity: 75,
      is_active: true,
      avg_rating: 4.5,
      category_id: catMap["home & living"] || categories[0]?.id || null,
    },
    {
      name: "Weighted Blanket — 7kg",
      slug: "weighted-blanket-7kg",
      description: "Premium glass bead filling in a removable organic cotton cover. The deep pressure stimulation helps reduce stress and improve sleep quality.",
      price: 145,
      stock_quantity: 30,
      is_active: true,
      avg_rating: 4.6,
      category_id: catMap["home & living"] || categories[0]?.id || null,
    },
    {
      name: "Stainless Tumbler 32oz",
      slug: "stainless-tumbler-32oz",
      description: "Double-wall vacuum insulation keeps drinks cold 24hrs or hot 12hrs. 18/8 stainless, BPA-free lid, fits most cup holders. 5 colors.",
      price: 38,
      stock_quantity: 120,
      is_active: true,
      avg_rating: 4.6,
      category_id: catMap["home & living"] || categories[0]?.id || null,
    },

    // ── Sports ──────────────────────────────────────────────────────
    {
      name: "Yoga Mat — Natural Rubber",
      slug: "yoga-mat-natural-rubber",
      description: "5mm natural tree rubber with microfibre suede surface. Grippy when wet, eco-friendly, and machine washable. Includes carrying strap.",
      price: 85,
      stock_quantity: 45,
      is_active: true,
      avg_rating: 4.7,
      category_id: catMap["sports"] || categories[0]?.id || null,
    },
    {
      name: "Adjustable Resistance Band Set",
      slug: "adjustable-resistance-band-set",
      description: "5 levels of resistance from 5–50 lbs. Premium latex, non-slip handles, and Door anchor included. Perfect for travel or home gym.",
      price: 35,
      stock_quantity: 95,
      is_active: true,
      avg_rating: 4.4,
      category_id: catMap["sports"] || categories[0]?.id || null,
    },
    {
      name: "Insulated Gym Bag",
      slug: "insulated-gym-bag",
      description: "Duffle bag with thermal compartment for wet clothes, ventilated shoe compartment, and laptop sleeve. Water-resistant nylon with YKK zippers.",
      price: 78,
      stock_quantity: 50,
      is_active: true,
      avg_rating: 4.5,
      category_id: catMap["sports"] || categories[0]?.id || null,
    },
  ];

  const results = { created: [] as string[], errors: [] as string[] };

  for (const product of PRODUCTS) {
    const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      const data = await res.json();
      results.created.push(`${product.name} (ID: ${data[0]?.id})`);
    } else {
      const err = await res.text();
      results.errors.push(`${product.name}: ${err}`);
    }
  }

  return NextResponse.json(
    { message: `Seeded ${results.created.length} products`, results },
    { status: 201 }
  );
}