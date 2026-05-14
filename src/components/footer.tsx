"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Send, ArrowUpRight } from "lucide-react";

const SOCIAL = [
  { Icon: Globe, label: "Instagram", href: "https://instagram.com" },
  { Icon: Send, label: "Twitter", href: "https://twitter.com" },
  { Icon: ArrowUpRight, label: "Website", href: "https://hermes.com" },
];

const QUICK_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Sale", href: "/sale" },
];

const SUPPORT_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-bold text-lg tracking-[0.25em] text-foreground">HERMES</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium fashion & lifestyle. Curated collections for the modern individual.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground mb-5">
              Newsletter
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get exclusive offers and updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-border rounded-full py-2.5 px-4 pr-11 text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-500 pl-1">
                  You&apos;re subscribed. Welcome aboard.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HERMES. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}