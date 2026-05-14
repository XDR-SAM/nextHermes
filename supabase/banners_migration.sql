-- ============================================================
-- Banners table for hero/promo banners admin-controllable
-- ============================================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  background_image TEXT,
  text_color TEXT DEFAULT 'white',
  button_style TEXT DEFAULT 'primary',
  position TEXT DEFAULT 'hero' CHECK (position IN ('hero', 'promo', 'announcement', 'footer')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  show_from TIMESTAMPTZ,
  show_until TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Everyone can read active banners
CREATE POLICY "Public read active banners"
  ON banners FOR SELECT
  USING (is_active = true);

-- Only admin/super_admin can do everything else
CREATE POLICY "Admin full access banners"
  ON banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();