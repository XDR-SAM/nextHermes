"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Camera, CircleUser, ArrowRight } from "lucide-react";

const FOOTER_LINKS = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Sale", href: "/sale" },
  ],
  "Categories": [
    { label: "Men", href: "/categories/men" },
    { label: "Women", href: "/categories/women" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "Footwear", href: "/categories/footwear" },
    { label: "Watches", href: "/categories/watches" },
  ],
  "Support": [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
};

const SOCIAL_LINKS = [
  { icon: X, label: "Twitter / X", href: "https://twitter.com" },
  { icon: Camera, label: "Camera", href: "https://instagram.com" },
  { icon: CircleUser, label: "CircleUser", href: "https://facebook.com" },
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
    <footer className="bg-black text-white border-t border-white/10">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand Column */}
        <div className="space-y-5">
          <Link href="/" className="inline-block">
            <span className="text-white font-bold text-xl tracking-[0.2em]">HERMES</span>
          </Link>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
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
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all duration-300"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {FOOTER_LINKS["Quick Links"].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
            Categories
          </h3>
          <ul className="space-y-3">
            {FOOTER_LINKS["Categories"].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-6">
            Newsletter
          </h3>
          <p className="text-sm text-white/50 mb-5 leading-relaxed">
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
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors"
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
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} HERMES. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS["Support"].slice(-3).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
