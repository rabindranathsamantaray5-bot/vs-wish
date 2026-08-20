"use client";

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCancelButton } from "@/components/auth/AuthCancelButton";

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // 2. Verify admin role
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: authData.user.id,
        _role: "admin",
      });

      if (roleError || !isAdmin) {
        await supabase.auth.signOut();
        setError("Forbidden: Admin access required");
        setLoading(false);
        return;
      }

      // Success: redirect to admin dashboard
      if (typeof window !== "undefined") {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#6d4aff]/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#ff5fa2]/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,15,25,0.6) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[420px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8"
      >
        <AuthCancelButton label="Cancel admin sign in and return to home" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#6d4aff] to-[#ff5fa2] grid place-items-center shadow-lg">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="font-display font-bold text-[19px] text-slate-900 dark:text-slate-50 leading-none">
              WishFly
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Admin Console</div>
          </div>
        </div>

        <div className="mt-8">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-[#6d4aff]">
            <Shield className="w-3 h-3" /> Secure Sign In
          </div>
          <h1 className="mt-3 font-display font-bold text-[26px] text-slate-900 dark:text-slate-50 leading-tight">
            Welcome back, Admin
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
            Sign in to manage the WishFly platform.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-7 space-y-4" data-testid="admin-login-form">
          <div>
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <div className="mt-1.5 relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                data-testid="login-email-input"
                type="email"
                disabled={!hydrated}
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wishfly.local"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/40 outline-none text-[14px] text-slate-800 dark:text-slate-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="mt-1.5 relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                data-testid="login-password-input"
                type={showPw ? "text" : "password"}
                disabled={!hydrated}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/40 outline-none text-[14px] text-slate-800 dark:text-slate-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                data-testid="toggle-password-visibility"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              data-testid="login-error"
              className="text-[12.5px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          <button
            data-testid="login-submit-btn"
            type="button"
            onClick={handleLogin}
            disabled={loading || !hydrated}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] text-white font-semibold text-[14px] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11.5px] text-slate-400 dark:text-slate-500 mt-4">
            Admin credentials are configured in server environment.
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — WishFly Console" },
      {
        name: "description",
        content:
          "Secure sign in to the WishFly admin console to manage templates, wishes and users.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — WishFly Console" },
      { property: "og:description", content: "Secure sign in to the WishFly admin console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLoginPage,
});
