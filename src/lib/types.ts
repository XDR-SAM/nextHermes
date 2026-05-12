// Role hierarchy: super_admin > admin > moderator > user
export type UserRole = "super_admin" | "admin" | "moderator" | "user";

export interface Profile {
  id: string; email: string; full_name: string | null;
  avatar_url: string | null; role: UserRole;
  tenant_id: string | null; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface Tenant {
  id: string; name: string; slug: string;
  domain: string | null; logo_url: string | null;
  brand_color: string; is_active: boolean;
  created_at: string; updated_at: string;
}

export type Permission =
  | "dashboard:view" | "tenants:manage" | "tenants:view"
  | "users:manage" | "users:view" | "profile:edit";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ["dashboard:view","tenants:manage","tenants:view","users:manage","users:view","profile:edit"],
  admin:       ["dashboard:view","tenants:view","users:manage","users:view","profile:edit"],
  moderator:   ["dashboard:view","tenants:view","users:view","profile:edit"],
  user:        ["dashboard:view","profile:edit"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin", admin: "Admin",
  moderator: "Moderator", user: "User",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "#3ecf8e", admin: "#a78bfa",
  moderator: "#60a5fa", user: "#898989",
};
