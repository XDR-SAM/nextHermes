"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme from localStorage and apply to <html>
    // This handles the initial hydration case properly
    const stored = localStorage.getItem("hermes-theme");
    const theme = stored ? JSON.parse(stored).state?.theme : "dark";
    // Also toggle .dark class on <html> for Tailwind dark: variants
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme ?? "dark");

    // Subscribe to future theme changes
    const unsub = useThemeStore.subscribe((state) => {
      document.documentElement.classList.toggle("dark", state.theme === "dark");
      document.documentElement.setAttribute("data-theme", state.theme);
    });

    setMounted(true);
    return unsub;
  }, []);

  // Prevent hydration mismatch — render children only after client mount
  if (!mounted) return null;

  return <>{children}</>;
}
