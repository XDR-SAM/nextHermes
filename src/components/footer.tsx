"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Camera, CircleUser } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Sale", href: "/sale" },
];

const SUPPORT_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
];

const SOCIAL_LINKS = [
  { icon: Globe, label: "Website", href: "https://hermes.com" },
  { icon: Camera, label: "Camera", href: "https://instagram.com" },
  { icon: CircleUser, label: "Profile", href: "https://facebook.com" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className={cn(
      "border-t",
      isDark ? "bg-[#0a0a0a] border-[#222] text-white" : "bg-[#f5f5f5] border-[#e5e5e5] text-black"
    )}>
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand Column */}
        <div className="space-y-5">
          <Link href="/" className="inline-block">
            <span className={cn(
              "font-bold text-xl tracking-[0.2em]",
              isDark ? "text-white" : "text-black"
            )}>
              HERMES
            </span>
          </Link>
          <p className={cn(
            "text-sm leading-relaxed max-w-xs",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            Premium fashion & lifestyle. Curated collections for the modern individual.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-1">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300",
                  isDark
                    ? "border-[#222] text-[#888] hover:text-white hover:border-white/50"
                    : "border-[#e5e5e5] text-[#666] hover:text-black hover:border-black/50"
                )}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className={cn(
            "text-xs font-semibold uppercase tracking-widest mb-6",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            Quick Links
          </h3>
          <ul className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors duration-200",
                    isDark
                      ? "text-white/60 hover:text-white"
                      : "text-black/60 hover:text-black"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className={cn(
            "text-xs font-semibold uppercase tracking-widest mb-6",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            Categories
          </h3>
          <ul className="space-y-3">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors duration-200",
                    isDark
                      ? "text-white/60 hover:text-white"
                      : "text-black/60 hover:text-black"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h3 className={cn(
            "text-xs font-semibold uppercase tracking-widest mb-6",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            Newsletter
          </h3>
          <p className={cn(
            "text-sm mb-5 leading-relaxed",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            Get exclusive offers and updates delivered to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "w-full border rounded-full py-2.5 px-4 pr-12 text-sm placeholder:transition-colors focus:outline-none transition-all",
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 focus:bg-white/10"
                    : "bg-black/5 border-black/10 text-black placeholder:text-gray-400 focus:border-black/30 focus:bg-black/10"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isDark
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-black text-white hover:bg-black/90"
                )}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {subscribed && (
              <p className="text-xs text-emerald-400 pl-1">
                Thanks for subscribing!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={cn(
        "border-t",
        isDark ? "border-[#222]" : "border-[#e5e5e5]"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={cn(
            "text-xs",
            isDark ? "text-[#888]" : "text-[#666]"
          )}>
            © {new Date().getFullYear()} HERMES. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className={cn(
                "text-xs transition-colors",
                isDark ? "text-[#888] hover:text-white/70" : "text-[#666] hover:text-black/70"
              )}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={cn(
                "text-xs transition-colors",
                isDark ? "text-[#888] hover:text-white/70" : "text-[#666] hover:text-black/70"
              )}
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className={cn(
                "text-xs transition-colors",
                isDark ? "text-[#888] hover:text-white/70" : "text-[#666] hover:text-black/70"
              )}
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
