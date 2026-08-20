"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X, ChevronRight, Sun, Moon } from "lucide-react";
import { MAIN_NAV } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

/* ---------------- Dark Mode Toggle (shared) ---------------- */
export const DarkToggle = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("wc-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("wc-theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-10 grid place-items-center rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4aff]"
    >
      {dark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
};

/* ---------------- Global Site Header (Floating Pill Nav) ---------------- */
export function SiteHeader({ active = "" }) {
  const { site } = usePublicSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const sessionUser = data.session?.user;
        const metadata = sessionUser?.user_metadata || {};
        setMe(
          sessionUser
            ? {
                ...sessionUser,
                name: metadata.full_name || sessionUser.email?.split("@")[0] || "User",
              }
            : null,
        );
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));
  }, []);
  const firstName = me?.name?.split(" ")[0] || "";
  const isActive = (href) => active === href;
  return (
    <>
      <motion.header
        data-testid="site-header"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
      >
        <div
          className={`pointer-events-auto w-full max-w-5xl relative flex items-center justify-between gap-2 pl-2 pr-1.5 sm:pl-3 sm:pr-2 py-1.5 sm:py-2 rounded-full transition-all duration-500 ${scrolled ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/70 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(109,74,255,0.35)]" : "bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(109,74,255,0.25)]"}`}
        >
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0 min-w-0"
            aria-label={`${site.siteName} home`}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#ff5fa2] to-[#ff9f43] grid place-items-center shadow-lg shrink-0"
            >
              <Heart className="w-4 h-4 text-white fill-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#ff9f43] animate-pulse-glow" />
            </motion.div>
            <div className="max-w-[128px] truncate whitespace-nowrap font-display font-bold text-[13px] text-slate-900 tracking-tight dark:text-slate-100 sm:max-w-[180px] sm:text-[17px]">
              {site.siteName}
            </div>
          </a>
          {/* Center nav */}
          <nav
            className="hidden md:flex items-center gap-0.5 lg:gap-1 px-1 shrink-0"
            aria-label="Main navigation"
          >
            {MAIN_NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className={`relative px-2.5 lg:px-3.5 py-2 text-[12px] lg:text-[13px] font-medium rounded-full transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4aff] ${isActive(n.href) ? "text-[#6d4aff] bg-purple-50 dark:bg-purple-900/40 font-semibold" : "text-slate-700 dark:text-slate-300 hover:text-[#6d4aff] hover:bg-purple-50/70 dark:hover:bg-purple-900/30"}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {authReady && !me && (
              <>
                <a
                  href="/account/login"
                  data-testid="header-sign-in"
                  className="hidden sm:inline-flex items-center h-8 sm:h-10 px-3 sm:px-4 rounded-full text-[12px] sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6d4aff] hover:bg-purple-50/70 dark:hover:bg-purple-900/30 transition"
                >
                  Sign In
                </a>
                <a
                  href="/account/register"
                  data-testid="header-sign-up"
                  className="hidden sm:inline-flex items-center h-8 sm:h-10 px-3 sm:px-4 rounded-full text-[12px] sm:text-[13px] font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition"
                >
                  Sign Up
                </a>
              </>
            )}
            {authReady && me && (
              <a
                href="/account"
                data-testid="header-my-account"
                title="My Account"
                className="hidden sm:inline-flex items-center gap-2 pl-1 pr-3 sm:pr-4 h-8 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 hover:border-[#6d4aff] hover:bg-purple-50 dark:hover:bg-purple-900/30 transition group"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-[10px] sm:text-[11px] font-bold overflow-hidden">
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (me.name || "U")[0].toUpperCase()
                  )}
                </span>
                <span className="text-[11px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#6d4aff] max-w-[80px] truncate">
                  {firstName || "Account"}
                </span>
              </a>
            )}
            <DarkToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 grid place-items-center rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700 shrink-0"
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#ff5fa2] to-[#ff9f43] grid place-items-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="font-display font-bold text-slate-900 dark:text-slate-100">
                    {site.siteName}
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {authReady && me ? (
                <a
                  href="/account"
                  className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-100 dark:border-purple-900/40"
                  data-testid="mobile-my-account"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-sm font-bold overflow-hidden">
                    {me.avatarUrl ? (
                      <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (me.name || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-[#6d4aff] font-bold">
                      Signed in
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {me.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">Manage account →</div>
                  </div>
                </a>
              ) : authReady && !me ? (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <a
                    href="/account/login"
                    onClick={() => setMenuOpen(false)}
                    data-testid="mobile-sign-in"
                    className="h-11 rounded-full border border-slate-200 dark:border-slate-700 text-[13px] font-semibold inline-flex items-center justify-center text-slate-800 dark:text-slate-200 hover:border-[#6d4aff] transition"
                  >
                    Sign In
                  </a>
                  <a
                    href="/account/register"
                    onClick={() => setMenuOpen(false)}
                    data-testid="mobile-sign-up"
                    className="h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition"
                  >
                    Sign Up
                  </a>
                </div>
              ) : null}

              <nav className="mt-6 space-y-1" aria-label="Mobile navigation">
                {MAIN_NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`flex items-center justify-between p-3 rounded-xl text-[15px] font-medium ${isActive(n.href) ? "bg-purple-50 dark:bg-purple-900/30 text-[#6d4aff]" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    {n.label} <ChevronRight className="w-4 h-4 opacity-60" />
                  </a>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SiteHeader;
