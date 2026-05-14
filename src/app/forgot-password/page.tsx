"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email.");
      } else {
        setMessage(data.message || "Check your email for a reset link.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#E5E5E0]">
          <div className="text-center mb-8">
            <Link href="/login" className="text-2xl font-bold tracking-tight mb-2 inline-block text-[#141413]">
              Hermes
            </Link>
            <h1 className="text-2xl font-bold mt-4 mb-2 text-[#141413]">
              Forgot Password?
            </h1>
            <p className="text-sm text-[#6B6B67]">
              No worries, we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-600">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-[#6B6B67]">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sami@hermes.com"
                required
                disabled={loading || !!message}
                className="bg-[#FAFAF8] border border-[#E5E5E0] text-[#141413]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !!message}
              className="w-full h-11 font-semibold text-sm transition-all bg-[#141413] hover:opacity-85"
            >
              {loading ? "Sending..." : message ? "Email Sent!" : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm mt-6 text-[#6B6B67]">
            Remember your password?{" "}
            <Link href="/login" className="font-medium hover:underline text-[#141413]">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}