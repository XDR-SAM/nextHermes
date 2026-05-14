"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Send, ArrowUpRight } from "lucide-react";

const SOCIAL = [
  { Icon: Globe, label: "Instagram", href: "https://instagram.com" },
  { Icon: Send, label: "Twitter", href: "https://twitter.com" },
  { Icon: ArrowUpRight, label: "Website", href: "https://hermes.com" },
];

const SHOP_LINKS = [
  { label: "Shop All", href: "/products" },
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

const ACCOUNT_LINKS = [
  { label: "Track Order", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Sign In", href: "/login" },
  { label: "Register", href: "/register" },
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
    <footer className="border-t border-[#E5E5E0] bg-[#FAFAF8]">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">

          {/* Brand — spans 2 cols on lg */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-bold text-base tracking-[0.3em] text-[#141413]">HERMES</span>
            </Link>
            <p className="text-sm text-[#6B6B67] leading-relaxed max-w-[260px]">
              Premium fashion & lifestyle. Curated collections for the modern individual.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {SOCIAL.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-[10px] border border-[#E5E5E0] flex items-center justify-center text-[#6B6B67] hover:text-[#141413] hover:border-[#141413] hover:bg-[#141413] hover:text-[#FAFAF8] transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141413]">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B67] hover:text-[#141413] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141413]">
              Support
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B67] hover:text-[#141413] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141413]">
              Account
            </h3>
            <ul className="space-y-3">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B67] hover:text-[#141413] transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter inline */}
            <div className="pt-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141413] mb-3">
                Newsletter
              </h3>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-[#E5E5E0] rounded-[10px] py-2.5 px-4 pr-10 text-sm bg-[#F4F4F1] text-[#141413] placeholder:text-[#6B6B67] focus:outline-none focus:border-[#141413] transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-[8px] bg-[#141413] text-[#FAFAF8] flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
                {subscribed && (
                  <p className="text-xs text-[#16A34A] pl-1">You&apos;re subscribed. Welcome aboard.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#E5E5E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B6B67]">
            &copy; {new Date().getFullYear()} HERMES. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-[#6B6B67] hover:text-[#141413] transition-colors duration-150"
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