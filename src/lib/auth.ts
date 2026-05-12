"use client";
import { createClient } from "@/utils/supabase/client";
import type { UserRole } from "@/lib/types";

const supabase = createClient();

export async function signUp(email: string, password: string, fullName: string, role: UserRole = "user") {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getProfile(userId: string) {
  return await supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  return await supabase.from("profiles").update(updates).eq("id", userId).select().single();
}
