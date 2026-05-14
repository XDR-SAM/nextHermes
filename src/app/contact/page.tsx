"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full border border-[#E5E5E0] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Message Sent!</h2>
          <p className="text-[#6B6B67] mb-8">
            Thanks for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <Button
            onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            variant="secondary"
            className="w-full"
          >
            Send Another Message
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#141413]">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-3xl mx-auto relative">
          <FadeSection>
            <p className="text-sm uppercase tracking-[0.3em] text-[#6B6B67] mb-4">
              Get in Touch
            </p>
          </FadeSection>
          <FadeSection delay={0.1}>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              We&apos;d love to hear from you
            </h1>
          </FadeSection>
          <FadeSection delay={0.2}>
            <p className="text-[#6B6B67] text-lg max-w-xl mx-auto">
              Whether you have a question, need help with an order, or just want
              to say hello — we&apos;re always here for you.
            </p>
          </FadeSection>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <FadeSection>
              <div className="bg-[white] border border-[#E5E5E0] rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-6">Send us a message</h2>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-[#6B6B67] uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Doe"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B6B67] uppercase tracking-wider mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="jane@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B6B67] uppercase tracking-wider mb-2">
                      Subject
                    </label>
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="How can we help?"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B6B67] uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us more..."
                      required
                      disabled={loading}
                      rows={5}
                      className="w-full px-4 py-3 bg-transparent border border-[#E5E5E0] rounded-xl text-sm text-[#141413] placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </FadeSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <FadeSection delay={0.1}>
              <div className="bg-[white] border border-[#E5E5E0] rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold mb-2">Contact Information</h3>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#141413]/10 text-[#141413] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B67] mb-0.5">Email</p>
                    <a href="mailto:hello@hermes.store" className="text-sm hover:text-[#141413] transition-colors">
                      hello@hermes.store
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#141413]/10 text-[#141413] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B67] mb-0.5">Phone</p>
                    <a href="tel:+18005551234" className="text-sm hover:text-[#141413] transition-colors">
                      +1 (800) 555-1234
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#141413]/10 text-[#141413] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B67] mb-0.5">Address</p>
                    <p className="text-sm">123 Commerce Street<br />San Francisco, CA 94102</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#141413]/10 text-[#141413] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6B67] mb-0.5">Hours</p>
                    <p className="text-sm">Mon – Fri: 9am – 6pm PST</p>
                    <p className="text-sm text-[#6B6B67]">Sat – Sun: 10am – 4pm PST</p>
                  </div>
                </div>
              </div>
            </FadeSection>

            {/* Map placeholder */}
            <FadeSection delay={0.2}>
              <div className="bg-[white] border border-[#E5E5E0] rounded-2xl overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-[#F4F4F1] to-[#FAFAF8] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-[#6B6B67] mx-auto mb-2" />
                    <p className="text-xs text-[#6B6B67]">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </FadeSection>

            {/* FAQ link */}
            <FadeSection delay={0.3}>
              <div className="bg-[white] border border-[#E5E5E0] rounded-2xl p-6">
                <h3 className="font-semibold mb-2">Looking for quick answers?</h3>
                <p className="text-sm text-[#6B6B67] mb-4">
                  Check our FAQ page for answers to common questions about orders,
                  shipping, and returns.
                </p>
                <a
                  href="/faq"
                  className="text-sm text-[#141413] hover:underline transition-colors"
                >
                  Visit FAQ →
                </a>
              </div>
            </FadeSection>
          </div>
        </div>
      </div>
    </div>
  );
}
