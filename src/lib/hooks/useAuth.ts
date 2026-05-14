"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data as Profile | null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();

    // Listen for auth state changes to re-fetch profile on login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/login");
  }, [supabase, router]);

  return { profile, loading, signOut };
}