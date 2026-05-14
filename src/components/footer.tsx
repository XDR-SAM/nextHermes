"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Camera, CircleUser } from "lucide-react";
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] dark:bg-[#0a0a0a]">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand Column */}
        <div className="space-y-5">
          <Link href="/" className="inline-block">
            <span className="font-bold text-xl tracking-[0.2em] text-[var(--text)] dark:text-white">
              HERMES
            </span>
          </Link>
          <p className="text-sm leading-relaxed max-w-xs text-[var(--text-secondary)]">
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
                  "border-[var(--border)] text-[var(--text-secondary)]",
                  "hover:text-[var(--text)] hover:border-[var(--text-secondary)]",
                  "dark:border-white/20 dark:text-white/60 dark:hover:text-white dark:hover:border-white/50"
                )}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-6 text-[var(--text-secondary)]">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm transition-colors duration-200 text-[var(--text-secondary)] hover:text-[var(--text)] dark:text-white/60 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-6 text-[var(--text-secondary)]">
            Support
          </h3>
          <ul className="space-y-3">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm transition-colors duration-200 text-[var(--text-secondary)] hover:text-[var(--text)] dark:text-white/60 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-6 text-[var(--text-secondary)]">
            Newsletter
          </h3>
          <p className="text-sm mb-5 leading-relaxed text-[var(--text-secondary)]">
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
                  "bg-[var(--glass-bg)] border-[var(--border)] text-[var(--text)]",
                  "placeholder:text-[var(--text-secondary)]",
                  "focus:border-[var(--text-secondary)] dark:focus:border-white/30",
                  "dark:bg-white/5 dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:bg-white/10",
                  "dark:focus:border-white/30"
                )}
              />
              <button
                type="submit"
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  "bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
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
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} HERMES. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs transition-colors text-[var(--text-secondary)] hover:text-[var(--text)] dark:text-white/50 dark:hover:text-white/80"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}