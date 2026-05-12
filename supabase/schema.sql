-- ============================================================
-- SCHEMA: nextHermes E-commerce Multi-tenant Admin
-- ============================================================

-- --- ROLES ---
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- --- TENANTS (stores) ---
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#3ecf8e',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- PROFILES (extends auth.users) ---
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_tenant_idx ON profiles(tenant_id);
CREATE INDEX tenants_slug_idx ON tenants(slug);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is admin or above within same tenant
CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user has at least moderator role
CREATE OR REPLACE FUNCTION is_moderator_or_above()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TENANTS POLICIES
-- ============================================================

-- Super admin can do everything with tenants
CREATE POLICY "Super admins manage all tenants"
  ON tenants FOR ALL
  TO authenticated
  USING (is_super_admin());

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Everyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Super admins can read all profiles
CREATE POLICY "Super admins read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Admins can read profiles within their tenant
CREATE POLICY "Admins read tenant profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (role = 'admin' OR role = 'moderator' OR role = 'user')
    AND tenant_id = get_user_tenant_id()
  );

-- Users can update their own profile (except role/tenant)
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can update profiles within their tenant (not super_admin)
CREATE POLICY "Admins update tenant profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    is_admin_or_above()
    AND tenant_id = get_user_tenant_id()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND target_role != 'super_admin'
    AND target_role != 'admin'
  );

-- Super admins can manage all profiles including role changes
CREATE POLICY "Super admins manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (is_super_admin());

COMMENT ON POLICY "Admins update tenant profiles" ON profiles IS
  'Admin can update moderator/user within their tenant. Role changes controlled separately.';