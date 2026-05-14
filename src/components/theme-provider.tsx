"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read persisted theme from localStorage and apply to <html>
    // This handles the initial hydration case properly
    const stored = localStorage.getItem("hermes-theme");
    const parsed = stored ? JSON.parse(stored) : null;
    const theme = parsed?.state?.theme ?? "dark";

    // Apply BOTH .dark class (for Tailwind dark: variants) AND data-theme (for CSS vars)
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);

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
