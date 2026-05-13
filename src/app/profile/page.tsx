"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  ChevronLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { profile, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change (static for now)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { data, error: apiError } = await updateProfile(profile.id, {
        full_name: fullName,
        phone,
      });

      if (apiError) {
        setError(apiError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle password change (calls real API)
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSaved(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password. Please try again.");
        return;
      }

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border)]">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-2">
            My Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your personal information
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text)] mb-6">
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={fullName || "User"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <User className="w-8 h-8 text-[var(--text-secondary)]" />
                  </div>
                )}
              </div>
              <div>
                <button className="flex items-center gap-2 bg-white/5 border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors">
                  <Camera className="w-4 h-4" />
                  Change Photo
                </button>
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  JPG, PNG or WEBP. Max 2MB.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text)] mb-6">
              Personal Information
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-secondary)] cursor-not-allowed opacity-60"
                  />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                  Contact support to change your email address.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all",
                    saved
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90",
                    saving && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : null}
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
              Change Password
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Leave blank if you don't want to change your password.
            </p>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
                  />
                </div>
              </div>

              {/* Password Error */}
              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}

              {/* Save Password Button */}
              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all",
                    passwordSaved
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 border border-[var(--border)] text-[var(--text)] hover:bg-white/20"
                  )}
                >
                  {passwordSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Password Updated!
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <div className="flex justify-start">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
