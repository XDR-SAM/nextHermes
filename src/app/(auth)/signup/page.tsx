"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EyeIcon = ({ open }: { open: boolean }) => (
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setEmailSent(true);
  };

  // Success state
  if (emailSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 text-center">
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-6"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-white/40 mb-2">
              We&apos;ve sent a verification link to
            </p>
            <p className="text-sm font-medium text-white/70 mb-6 break-all">{email}</p>
            <p className="text-xs text-white/25 mb-6">
              Click the link in the email to activate your account. Check your spam folder if it doesn&apos;t arrive within a few minutes.
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full text-sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold text-white tracking-tight mb-2"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm text-white/40"
            >
              Join the platform
            </motion.p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
                disabled={loading}
                className="w-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </motion.div>

            {/* Terms */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3 pt-1"
            >
              <button
                type="button"
                onClick={() => setAgreed((v) => !v)}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors"
                style={{
                  borderColor: agreed ? "transparent" : "rgba(255,255,255,0.2)",
                  background: agreed ? "white" : "transparent",
                }}
              >
                {agreed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <p className="text-xs text-white/30 leading-relaxed">
                I agree to the{" "}
                <a href="/terms" className="text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-white/50 hover:text-white/70 transition-colors underline underline-offset-2">
                  Privacy Policy
                </a>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold tracking-wide mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Account"}
              </Button>
            </motion.div>
          </form>
        </div>

        {/* Footer link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-white/30 mt-6"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-white/60 hover:text-white transition-colors font-medium">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
