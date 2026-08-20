import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
import { AuthCancelButton } from "@/components/auth/AuthCancelButton";

function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/account/register" });
  const redirect = search.redirect || "/";
  const { site, features, ready: settingsReady } = usePublicSettings();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!features.registrationEnabled) {
      setError("New account registration is currently disabled by the administrator.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
          },
        },
      });

      if (authError) {
        setError(
          authError.message.includes("rate limit")
            ? "Too many signup emails were requested. Please wait a few minutes and try again."
            : authError.message,
        );
      } else {
        if (data.session) navigate({ to: redirect });
        else
          setSuccess("Account created. Check your email and confirm the link before signing in.");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full h-12 pl-11 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] focus:ring-2 focus:ring-purple-100 outline-none text-[14px] text-slate-900 dark:text-white transition-all";

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-[#6d4aff]/20 blur-3xl animate-drift" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#ff5fa2]/20 blur-3xl animate-drift" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[440px] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white dark:border-slate-800 shadow-2xl p-8"
      >
        <AuthCancelButton />
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6] via-[#6d4aff] to-[#ff5fa2] grid place-items-center shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="font-display font-bold text-[18px] text-slate-900 dark:text-slate-50 leading-none">
              {site.siteName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{site.tagline}</div>
          </div>
        </Link>

        <div className="mt-8">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-[#6d4aff]">
            <Sparkles className="w-3 h-3" /> Get Started
          </div>
          <h1 className="mt-3 font-display font-bold text-[28px] text-slate-900 dark:text-slate-50 leading-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
            Save your wishes, unlock premium templates, and manage everything in one place.
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {settingsReady && !features.registrationEnabled && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
              data-testid="registration-disabled"
            >
              New registrations are currently disabled. Existing users can still sign in.
            </div>
          )}
          <F label="Full name" icon={User}>
            <input
              required
              disabled={!hydrated}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Priya Sharma"
              className={inp}
            />
          </F>
          <F label="Email" icon={Mail}>
            <input
              type="email"
              disabled={!hydrated}
              required
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={inp}
            />
          </F>
          <F label="Password" icon={Lock}>
            <input
              type={showPw ? "text" : "password"}
              disabled={!hydrated}
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              className={`${inp} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </F>

          {error && (
            <div className="text-[12.5px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="text-[12.5px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg px-3 py-2"
            >
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={
              loading ||
              Boolean(success) ||
              !hydrated ||
              !settingsReady ||
              !features.registrationEnabled
            }
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] text-white font-semibold text-[14px] shadow-lg shadow-purple-500/25 disabled:opacity-60 hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center text-[13px] text-slate-600 dark:text-slate-400 pt-2">
            Already have an account?{" "}
            <Link
              to="/account/login"
              search={{ redirect }}
              className="font-semibold text-[#6d4aff] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

const F = ({ label, icon: Icon, children }) => (
  <div>
    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{label}</label>
    <div className="mt-1.5 relative">
      <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      {children}
    </div>
  </div>
);

import { z } from "zod";

export const Route = createFileRoute("/account/register")({
  component: RegisterPage,
  validateSearch: (search) =>
    z
      .object({
        redirect: z.string().optional(),
      })
      .parse(search),
});
