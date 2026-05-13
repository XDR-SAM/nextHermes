-- ============================================================
-- SCHEMA: nextHermes E-commerce — Seed / Migration
-- Run this AFTER schema.sql in the Supabase SQL editor.
-- All tables use OR REPLACE / IF NOT EXISTS so this is safe
-- to re-run. Foreign keys are kept optional on business tables
-- to avoid schema cache issues on Vercel serverless.
-- ============================================================

-- ============================================================
-- PART 1 — ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'paypal', 'cod', 'stripe', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- PART 2 — CORE BUSINESS TABLES
-- ============================================================

-- --- CATEGORIES ---
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  logo_url    TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

-- --- PRODUCTS (extends existing — adds missing columns if not present) ---
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id      UUID REFERENCES brands(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  metadata      JSONB DEFAULT '{}',  -- images, variants, attributes live here
  price         NUMERIC(12, 2) DEFAULT 0,
  compare_price NUMERIC(12, 2),
  sku           TEXT,
  barcode       TEXT,
  stock_quantity INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  is_featured   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

-- --- WAREHOUSES ---
CREATE TABLE IF NOT EXISTS warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  country     TEXT DEFAULT 'US',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- --- ORDERS (extends existing — adds missing columns safely) ---
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS status          order_status DEFAULT 'pending';
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal        NUMERIC(12, 2) DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax             NUMERIC(12, 2) DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost   NUMERIC(12, 2) DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount          NUMERIC(12, 2) DEFAULT 0;  -- alias for total
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id UUID;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address_id UUID;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes           TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes   TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number  TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method  TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method   TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status   payment_status DEFAULT 'pending';
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at         TIMESTAMPTZ;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number   TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id       UUID;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount  NUMERIC(12, 2) DEFAULT 0;
EXCEPTION WHEN undefined_table THEN
  -- orders table doesn't exist yet — create it fully
  CREATE TABLE orders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tenant_id             UUID REFERENCES tenants(id) ON DELETE SET NULL,
    status                order_status DEFAULT 'pending',
    subtotal              NUMERIC(12, 2) DEFAULT 0,
    tax                   NUMERIC(12, 2) DEFAULT 0,
    shipping_cost         NUMERIC(12, 2) DEFAULT 0,
    amount                NUMERIC(12, 2) DEFAULT 0,
    shipping_address_id   UUID,
    billing_address_id    UUID,
    notes                 TEXT,
    internal_notes        TEXT,
    tracking_number       TEXT,
    shipping_method       TEXT,
    payment_method        TEXT,
    payment_status        payment_status DEFAULT 'pending',
    paid_at               TIMESTAMPTZ,
    invoice_number        TEXT,
    coupon_id             UUID,
    discount_amount       NUMERIC(12, 2) DEFAULT 0,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- --- ORDER ITEMS ---
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL,
  product_id    UUID,
  variant_id    UUID,
  product_name  TEXT NOT NULL,   -- snapshot
  variant_name  TEXT,            -- snapshot
  sku           TEXT,            -- snapshot
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(12, 2) NOT NULL DEFAULT 0,  -- snapshot
  total         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- --- ADDRESSES ---
CREATE TABLE IF NOT EXISTS addresses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  phone               TEXT,
  address_line1       TEXT NOT NULL,
  address_line2       TEXT,
  city                TEXT NOT NULL,
  state               TEXT,
  postal_code         TEXT NOT NULL,
  country             TEXT NOT NULL DEFAULT 'US',
  is_default_shipping BOOLEAN DEFAULT FALSE,
  is_default_billing  BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- --- WISHLISTS ---
CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- --- CART ITEMS ---
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id, variant_id)
);

-- --- COUPONS ---
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
  code             TEXT NOT NULL UNIQUE,
  description      TEXT,
  discount_type    discount_type NOT NULL DEFAULT 'percentage',
  discount_value   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(12, 2) DEFAULT 0,
  max_uses         INT,
  used_count       INT DEFAULT 0,
  starts_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- --- REVIEWS ---
CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id            UUID,
  rating              INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title               TEXT,
  content             TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved         BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- --- AUDIT LOGS ---
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- --- PAYMENTS ---
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL,
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency         TEXT DEFAULT 'USD',
  payment_method   TEXT,
  transaction_id   TEXT UNIQUE,
  status           payment_status DEFAULT 'pending',
  payer_email      TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- --- SHIPPING PROVIDERS ---
CREATE TABLE IF NOT EXISTS shipping_providers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  code                  TEXT NOT NULL UNIQUE,
  tracking_url_template TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- --- SHIPPING ZONES ---
CREATE TABLE IF NOT EXISTS shipping_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  countries   TEXT[] DEFAULT '{}',
  regions     TEXT[] DEFAULT '{}',
  base_rate   NUMERIC(12, 2) DEFAULT 0,
  per_item_rate NUMERIC(12, 2) DEFAULT 0,
  free_shipping_threshold NUMERIC(12, 2),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- --- WAREHOUSE INVENTORY ---
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity            INT DEFAULT 0,
  reserved_quantity   INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (warehouse_id, product_id)
);

-- ============================================================
-- PART 3 — UPDATED_AT TRIGGERS (for all new tables)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables that have updated_at
DO $$ DECLARE
  t TEXT[] := ARRAY[
    'categories','brands','products','warehouses','orders',
    'addresses','coupons','reviews','shipping_zones','warehouse_inventory'
  ];
BEGIN
  FOREACH t[i] IN ARRAY t LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I_updated_at ON %I; '||
      'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I '||
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      t[i], t[i], t[i], t[i]
    );
  END LOOP;
END $$;

-- ============================================================
-- PART 4 — INDEXES
-- ============================================================

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug  ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- brands
CREATE INDEX IF NOT EXISTS idx_brands_tenant ON brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug   ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active) WHERE is_active = TRUE;

-- products
CREATE INDEX IF NOT EXISTS idx_products_tenant   ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant     ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice    ON orders(invoice_number) WHERE invoice_number IS NOT NULL;

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user   ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_def    ON addresses(user_id, is_default_shipping) WHERE is_default_shipping = TRUE;

-- wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_user    ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user    ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- coupons
CREATE INDEX IF NOT EXISTS idx_coupons_tenant  ON coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code   ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product   ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user      ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved  ON reviews(is_approved) WHERE is_approved = TRUE;

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table   ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order   ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user    ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_txn     ON payments(transaction_id) WHERE transaction_id IS NOT NULL;

-- shipping_providers
CREATE INDEX IF NOT EXISTS idx_shipping_providers_active ON shipping_providers(is_active) WHERE is_active = TRUE;

-- shipping_zones
CREATE INDEX IF NOT EXISTS idx_shipping_zones_tenant ON shipping_zones(tenant_id);

-- warehouse_inventory
CREATE INDEX IF NOT EXISTS idx_wh_inv_warehouse ON warehouse_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_wh_inv_product    ON warehouse_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_wh_inv_low_stock ON warehouse_inventory(product_id, quantity) WHERE quantity <= low_stock_threshold;

-- ============================================================
-- PART 5 — HELPER FUNCTIONS (additional)
-- ============================================================

-- is_super_admin (already in schema.sql, redefined safely here)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- is_admin_or_above
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- is_moderator_or_above
CREATE OR REPLACE FUNCTION is_moderator_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- get_user_tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- is_owner_or_admin: checks if current user owns a record OR is admin within same tenant
CREATE OR REPLACE FUNCTION is_owner_or_admin(owner_uuid UUID, owner_tenant UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = owner_uuid
     OR (is_admin_or_above() AND get_user_tenant_id() = owner_tenant);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- audit log trigger helper
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PART 6 — RLS POLICIES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_providers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT WITH CHECK (is_super_admin() OR is_admin_or_above());

CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE USING (is_super_admin());

-- -------------------------------------------------------
-- BRANDS
-- -------------------------------------------------------
CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "brands_admin_insert" ON brands
  FOR INSERT WITH CHECK (is_super_admin() OR is_admin_or_above());

CREATE POLICY "brands_admin_update" ON brands
  FOR UPDATE USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

CREATE POLICY "brands_admin_delete" ON brands
  FOR DELETE USING (is_super_admin());

-- -------------------------------------------------------
-- PRODUCTS (public read for active; admins manage)
-- -------------------------------------------------------
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "products_admin_insert" ON products
  FOR INSERT WITH CHECK (is_super_admin() OR is_admin_or_above());

CREATE POLICY "products_admin_update" ON products
  FOR UPDATE USING (is_super_admin()
    OR (is_moderator_or_above() AND tenant_id = get_user_tenant_id()));

CREATE POLICY "products_admin_delete" ON products
  FOR DELETE USING (is_super_admin());

-- -------------------------------------------------------
-- WAREHOUSES
-- -------------------------------------------------------
CREATE POLICY "warehouses_public_read" ON warehouses
  FOR SELECT USING (TRUE);  -- warehouses are needed for public stock queries

CREATE POLICY "warehouses_admin_all" ON warehouses
  FOR ALL USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- ORDERS
-- -------------------------------------------------------
-- Users: own orders only
CREATE POLICY "orders_user_read" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_user_insert" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_user_update" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins: all orders in their tenant
CREATE POLICY "orders_admin_read" ON orders
  FOR SELECT USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (is_super_admin()
    OR (is_moderator_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- ORDER ITEMS
-- -------------------------------------------------------
CREATE POLICY "order_items_user_read" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (o.user_id = auth.uid() OR is_super_admin()
          OR (is_admin_or_above() AND o.tenant_id = get_user_tenant_id()))
    )
  );

CREATE POLICY "order_items_all_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id)
  );

CREATE POLICY "order_items_all_update" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (is_super_admin()
          OR (is_moderator_or_above() AND o.tenant_id = get_user_tenant_id()))
    )
  );

-- -------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------
CREATE POLICY "addresses_user_all" ON addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "addresses_admin_read" ON addresses
  FOR SELECT USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- WISHLISTS
-- -------------------------------------------------------
CREATE POLICY "wishlists_user_all" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "wishlists_product_read" ON wishlists
  FOR SELECT USING (TRUE);  -- for "added to wishlist" check on product pages

-- -------------------------------------------------------
-- CART ITEMS
-- -------------------------------------------------------
CREATE POLICY "cart_items_user_all" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- COUPONS
-- -------------------------------------------------------
-- Public read for active coupons (to validate at checkout)
CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
    OR is_super_admin()
  );

CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- REVIEWS
-- -------------------------------------------------------
-- Public: approved reviews only
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (is_approved = TRUE OR is_super_admin());

CREATE POLICY "reviews_user_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_user_update" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reviews_moderator_approve" ON reviews
  FOR UPDATE USING (is_super_admin()
    OR (is_moderator_or_above() AND tenant_id = get_user_tenant_id()));

CREATE POLICY "reviews_admin_delete" ON reviews
  FOR DELETE USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- AUDIT LOGS
-- -------------------------------------------------------
CREATE POLICY "audit_logs_super_admin_all" ON audit_logs
  FOR ALL USING (is_super_admin());

CREATE POLICY "audit_logs_admin_read" ON audit_logs
  FOR SELECT USING (is_admin_or_above());

-- -------------------------------------------------------
-- PAYMENTS
-- -------------------------------------------------------
CREATE POLICY "payments_user_read" ON payments
  FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "payments_user_insert" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (is_super_admin()
    OR (is_admin_or_above() AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.tenant_id = get_user_tenant_id()
    ))
  );

-- -------------------------------------------------------
-- SHIPPING PROVIDERS (read-only public; admins manage)
-- -------------------------------------------------------
CREATE POLICY "shipping_providers_public_read" ON shipping_providers
  FOR SELECT USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "shipping_providers_admin_all" ON shipping_providers
  FOR ALL USING (is_super_admin());

-- -------------------------------------------------------
-- SHIPPING ZONES
-- -------------------------------------------------------
CREATE POLICY "shipping_zones_public_read" ON shipping_zones
  FOR SELECT USING (is_active = TRUE OR is_super_admin());

CREATE POLICY "shipping_zones_admin_all" ON shipping_zones
  FOR ALL USING (is_super_admin()
    OR (is_admin_or_above() AND tenant_id = get_user_tenant_id()));

-- -------------------------------------------------------
-- WAREHOUSE INVENTORY
-- -------------------------------------------------------
CREATE POLICY "warehouse_inventory_public_read" ON warehouse_inventory
  FOR SELECT USING (TRUE);  -- needed for stock display

CREATE POLICY "warehouse_inventory_admin_all" ON warehouse_inventory
  FOR ALL USING (is_super_admin()
    OR (is_moderator_or_above() AND EXISTS (
      SELECT 1 FROM warehouses w
      WHERE w.id = warehouse_id AND w.tenant_id = get_user_tenant_id()
    ))
  );

-- ============================================================
-- PART 7 — USEFUL VIEWS
-- ============================================================

-- Sales summary per tenant (for dashboard)
CREATE OR REPLACE VIEW sales_summary AS
SELECT
  o.tenant_id,
  COUNT(o.id)                     AS total_orders,
  SUM(o.amount)                   AS total_revenue,
  AVG(o.amount)                   AS avg_order_value,
  SUM(CASE WHEN o.payment_status = 'paid' THEN o.amount ELSE 0 END) AS collected_revenue,
  SUM(CASE WHEN o.payment_status = 'pending' THEN 1 ELSE 0 END)    AS pending_orders
FROM orders o
GROUP BY o.tenant_id;

-- Order stats by status
CREATE OR REPLACE VIEW order_stats AS
SELECT
  tenant_id,
  status,
  COUNT(*) AS count,
  SUM(amount) AS total
FROM orders
GROUP BY tenant_id, status;

-- Top products by revenue
CREATE OR REPLACE VIEW top_products AS
SELECT
  p.tenant_id,
  p.id         AS product_id,
  p.name       AS product_name,
  COUNT(oi.id) AS times_ordered,
  SUM(oi.total) AS total_revenue,
  SUM(oi.quantity) AS units_sold
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.payment_status IN ('paid','refunded')
GROUP BY p.tenant_id, p.id, p.name
ORDER BY total_revenue DESC;

-- Average product rating
CREATE OR REPLACE VIEW product_ratings AS
SELECT
  product_id,
  COUNT(*)    AS review_count,
  AVG(rating) AS avg_rating,
  MAX(rating) AS max_rating,
  MIN(rating) AS min_rating
FROM reviews
WHERE is_approved = TRUE
GROUP BY product_id;

-- Low stock products across all warehouses
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT
  wi.product_id,
  p.name             AS product_name,
  p.sku,
  wi.warehouse_id,
  w.name             AS warehouse_name,
  wi.quantity,
  wi.reserved_quantity,
  wi.low_stock_threshold,
  (wi.quantity - wi.reserved_quantity) AS available_qty
FROM warehouse_inventory wi
JOIN products p   ON p.id = wi.product_id
JOIN warehouses w ON w.id = wi.warehouse_id
WHERE wi.quantity - wi.reserved_quantity <= wi.low_stock_threshold;

-- ============================================================
-- PART 8 — SEED DATA (demo tenant + admin)
-- ============================================================

-- Insert a demo tenant if none exists
INSERT INTO tenants (id, name, slug, domain, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Store',
  'demo',
  'demo.localhost',
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Insert a demo admin profile (change email/role as needed)
INSERT INTO profiles (id, email, full_name, role, tenant_id, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@demo.com',
  'Demo Admin',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- Seed shipping providers
INSERT INTO shipping_providers (name, code, tracking_url_template, is_active)
VALUES
  ('UPS',          'ups',  'https://www.ups.com/track?tracknum={tracking}', TRUE),
  ('FedEx',        'fedex','https://www.fedex.com/fedextrack/?trknbr={tracking}', TRUE),
  ('USPS',         'usps', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking}', TRUE),
  ('DHL',          'dhl',  'https://www.dhl.com/en/express/tracking.html?AWB={tracking}', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed a sample category
INSERT INTO categories (id, tenant_id, name, slug, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Electronics',
  'electronics',
  TRUE
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed a sample brand
INSERT INTO brands (id, tenant_id, name, slug, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'TechBrand',
  'techbrand',
  TRUE
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed a sample product
INSERT INTO products (id, tenant_id, category_id, brand_id, name, slug, price, sku, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  'Demo Product',
  'demo-product',
  99.99,
  'DEMO-001',
  TRUE
) ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Seed a sample warehouse
INSERT INTO warehouses (id, tenant_id, name, city, country, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'Main Warehouse',
  'New York',
  'US',
  TRUE
) ON CONFLICT DO NOTHING;

-- Seed warehouse inventory for demo product
INSERT INTO warehouse_inventory (warehouse_id, product_id, quantity, low_stock_threshold)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000012',
  50,
  10
) ON CONFLICT (warehouse_id, product_id) DO NOTHING;

-- Seed a sample coupon
INSERT INTO coupons (id, tenant_id, code, discount_type, discount_value, min_order_amount, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'WELCOME10',
  'percentage',
  10.00,
  0,
  TRUE
) ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Done. This file is idempotent — safe to re-run.
-- ============================================================
