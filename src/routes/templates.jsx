"use client";
import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getTemplates } from "../lib/templates.functions";
import { getCategories } from "../lib/categories.functions";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Search,
  X,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Crown,
  Check,
  ArrowRight,
  Star,
  Flame,
  Loader2,
  ShoppingBag,
  Filter,
  Zap,
  Gift,
  Award,
  TrendingUp,
  Diamond,
  Eye,
  FileText,
} from "lucide-react";
import {
  getBatchTemplateAccess,
} from "../lib/purchases.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TemplatePricingCard } from "@/components/TemplatePricingCard";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/auth-client";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const PRICE_BUCKETS = [
  { id: "all", label: "All prices", icon: Diamond },
  { id: "free", label: "Free only", icon: Gift },
  { id: "u200", label: "Under ₹200", icon: Zap },
  { id: "200-500", label: "₹200 – ₹500", icon: Award },
  { id: "o500", label: "Over ₹500", icon: Crown },
];
const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];
// Per-category color themes for the chip strip
const CAT_THEME = {
  All: "from-[#6d4aff] to-[#ff5fa2]",
  Birthday: "from-pink-500 to-rose-500",
  Anniversary: "from-amber-500 to-orange-500",
  Wedding: "from-rose-500 to-pink-500",
  Love: "from-rose-500 to-red-500",
  "Baby Shower": "from-sky-500 to-blue-500",
  Festivals: "from-fuchsia-500 to-purple-500",
  Invitations: "from-indigo-500 to-violet-500",
  Independence: "from-orange-500 to-emerald-500",
  Diwali: "from-amber-500 to-orange-600",
  Christmas: "from-emerald-500 to-green-600",
  "New Year": "from-violet-500 to-fuchsia-500",
  More: "from-slate-500 to-slate-700",
};

function TemplatesShopPage() {
  return (
    <Suspense fallback={<Splash />}>
      <TemplatesInner />
    </Suspense>
  );
}
function Splash() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-[#6d4aff] animate-spin" />
    </div>
  );
}

function TemplatesInner() {
  const { site } = usePublicSettings();
  const params = useSearch({ from: "/templates" });
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [dark, setDark] = useState(false);
  const fetchTemplates = useServerFn(getTemplates);
  const fetchCategories = useServerFn(getCategories);
  const fetchBatchAccess = useServerFn(getBatchTemplateAccess);
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Batch access lookup for visible templates
  const { data: batchAccess } = useQuery({
    queryKey: ["batch-access", templates.map((t) => t.id)],
    queryFn: async () =>
      fetchBatchAccess({
        data: { templateIds: templates.map((t) => t.id) },
        headers: await getAuthHeaders(),
      }),
    enabled: templates.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (batchAccess?.results) {
      batchAccess.results.forEach((res) => {
        queryClient.setQueryData(["template-access", res.templateId], res);
      });
    }
  }, [batchAccess, queryClient]);

  const [q, setQ] = useState(params.q || "");
  const [cat, setCat] = useState(params.category || "All");
  const [price, setPrice] = useState(params.price || "all");
  const [sort, setSort] = useState(params.sort || "popular");
  const [tier, setTier] = useState(params.tier || "all");

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("wc-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    Promise.all([
      fetchTemplates().catch((e) => {
        console.error("Templates fetch error:", e);
        return { items: [] };
      }),
      fetchCategories().catch((e) => {
        console.error("Categories fetch error:", e);
        return { items: [] };
      }),
      supabase.auth
        .getSession()
        .then(({ data }) => ({ user: data.session?.user || null }))
        .catch(() => ({ user: null })),
    ]).then(([t, c, u]) => {
      const sessionUser = u?.user;
      const metadata = sessionUser?.user_metadata || {};
      setTemplates(t.items || []);
      setCategories(c.items || []);
      setMe(
        sessionUser
          ? {
              ...sessionUser,
              name: metadata.full_name || sessionUser.email?.split("@")[0] || "User",
              avatarUrl: metadata.avatar_url || "",
            }
          : null,
      );
      setAuthReady(true);
      setLoading(false);
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (cat !== "All") sp.set("category", cat);
    if (q) sp.set("q", q);
    if (price !== "all") sp.set("price", price);
    if (sort !== "popular") sp.set("sort", sort);
    if (tier !== "all") sp.set("tier", tier);
    const s = sp.toString();
    navigate({
      to: "/templates",
      search: Object.fromEntries(sp.entries()),
      replace: true,
      scroll: false,
    });
  }, [cat, q, price, sort, tier]);

  const toggleTheme = () => {
    const n = !dark;
    setDark(n);
    document.documentElement.classList.toggle("dark", n);
    localStorage.setItem("wc-theme", n ? "dark" : "light");
  };

  const finalPrice = (t) => (t.discountPrice != null ? t.discountPrice : t.price) || 0;

  const filtered = useMemo(() => {
    let arr = [...templates];
    if (cat && cat !== "All")
      arr = arr.filter((t) => (t.category || "").toLowerCase() === cat.toLowerCase());
    if (q) {
      const ql = q.toLowerCase();
      arr = arr.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(ql) ||
          (t.label || "").toLowerCase().includes(ql) ||
          (t.category || "").toLowerCase().includes(ql),
      );
    }
    if (price === "free") arr = arr.filter((t) => finalPrice(t) === 0);
    else if (price === "u200")
      arr = arr.filter((t) => {
        const p = finalPrice(t);
        return p > 0 && p < 200;
      });
    else if (price === "200-500")
      arr = arr.filter((t) => {
        const p = finalPrice(t);
        return p >= 200 && p <= 500;
      });
    else if (price === "o500") arr = arr.filter((t) => finalPrice(t) > 500);
    if (tier === "free") arr = arr.filter((t) => !t.isPremium);
    else if (tier === "premium") arr = arr.filter((t) => t.isPremium);
    if (sort === "newest") arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === "price-asc") arr.sort((a, b) => finalPrice(a) - finalPrice(b));
    else if (sort === "price-desc") arr.sort((a, b) => finalPrice(b) - finalPrice(a));
    else arr.sort((a, b) => (a.order || 999) - (b.order || 999));
    return arr;
  }, [templates, cat, q, price, sort, tier]);

  const catChips = ["All", ...categories.map((c) => c.name)];
  const activeFilters = [
    cat !== "All" && { k: "cat", v: cat, onClear: () => setCat("All") },
    price !== "all" &&
      PRICE_BUCKETS.find((p) => p.id === price) && {
        k: "price",
        v: PRICE_BUCKETS.find((p) => p.id === price).label,
        onClear: () => setPrice("all"),
      },
    tier !== "all" &&
      (tier === "free" || tier === "premium") && {
        k: "tier",
        v: tier === "free" ? "Free tier" : "Premium tier",
        onClear: () => setTier("all"),
      },
    q && { k: "q", v: `"${q}"`, onClear: () => setQ("") },
  ].filter(Boolean);
  const clearAll = () => {
    setCat("All");
    setQ("");
    setPrice("all");
    setSort("popular");
    setTier("all");
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white via-purple-50/60 to-pink-50/60 dark:from-slate-950 dark:via-[#120a2a] dark:to-slate-950 overflow-x-hidden">
      {/* Ambient background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 w-[500px] h-[500px] rounded-full bg-[#6d4aff]/25 blur-3xl" />
        <div className="absolute -right-40 top-40 w-[600px] h-[600px] rounded-full bg-[#ff5fa2]/20 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 w-[500px] h-[500px] rounded-full bg-[#ff9f43]/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,15,25,0.7) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating pil header (matches home) */}
      <SiteHeader active="/templates" />
      {false && (
        <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
      >
        <div
          className={`pointer-events-auto w-full max-w-5xl relative flex items-center justify-between gap-2 pl-2 pr-1.5 sm:pl-3 sm:pr-2 py-1.5 sm:py-2 rounded-full transition-all duration-500 ${scrolled ? "bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/70 dark:border-slate-800 shadow-[0_10px_40px_-10px_rgba(109,74,255,0.35)]" : "bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_10px_30px_-15px_rgba(109,74,255,0.25)]"}`}
        >
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#ff5fa2] to-[#ff9f43] grid place-items-center shadow-lg shrink-0"
            >
              <Heart className="w-4 h-4 text-white fill-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#ff9f43] animate-pulse-glow" />
            </motion.div>
            <div className="font-display font-bold text-[14px] sm:text-[17px] text-slate-900 dark:text-slate-100 tracking-tight hidden xs:block sm:block whitespace-nowrap">
              {site.siteName}
            </div>
          </Link>
          {/* Center nav (matches home) */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 px-1 shrink-0">
            {[
              { href: "/templates", label: "Templates" },
              { href: "/#categories", label: "Categories" },
              { href: "/#how", label: "How It Works" },
              { href: "/pricing", label: "Pricing" },
            ].map((n) => (
              <Link
                key={n.label}
                to={n.href}
                className="relative px-2.5 lg:px-3.5 py-2 text-[12px] lg:text-[13px] font-medium rounded-full text-slate-700 dark:text-slate-300 hover:text-[#6d4aff] hover:bg-purple-50/70 dark:hover:bg-purple-900/30 transition-all whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {/* Right actions (matches home) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {authReady && me ? (
              <Link
                to="/account"
                data-testid="header-my-account"
                className="hidden sm:inline-flex items-center gap-2 pl-1 pr-3 sm:pr-4 h-8 sm:h-10 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 hover:border-[#6d4aff] hover:bg-purple-50 dark:hover:bg-purple-900/30 transition group"
                title="My Account"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-[10px] sm:text-[11px] font-bold overflow-hidden">
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (me.name || "U")[0].toUpperCase()
                  )}
                </span>
                <span className="text-[11px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#6d4aff] max-w-[80px] truncate">
                  {me.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
            ) : authReady && !me ? (
              <>
                <Link
                  to="/account/login"
                  data-testid="header-sign-in"
                  className="hidden sm:inline-flex items-center h-8 sm:h-10 px-3 sm:px-4 rounded-full text-[12px] sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-[#6d4aff] hover:bg-purple-50/70 dark:hover:bg-purple-900/30 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/account/register"
                  data-testid="header-sign-up"
                  className="hidden sm:inline-flex items-center h-8 sm:h-10 px-3 sm:px-4 rounded-full text-[12px] sm:text-[13px] font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : null}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              data-testid="theme-toggle"
              className="relative w-10 h-10 grid place-items-center rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition"
            >
              {dark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 grid place-items-center rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700 shrink-0"
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu (matches home) */}
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
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {authReady && me ? (
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-100 dark:border-purple-900/40"
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
                </Link>
              ) : authReady && !me ? (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Link
                    to="/account/login"
                    onClick={() => setMenuOpen(false)}
                    className="h-11 rounded-full border border-slate-200 dark:border-slate-700 text-[13px] font-semibold inline-flex items-center justify-center text-slate-800 dark:text-slate-200 hover:border-[#6d4aff] transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/account/register"
                    onClick={() => setMenuOpen(false)}
                    className="h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[13px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : null}

              <nav className="mt-6 space-y-1">
                {[
                  { href: "/templates", label: "Templates" },
                  { href: "/#categories", label: "Categories" },
                  { href: "/#how", label: "How It Works" },
                  { href: "/pricing", label: "Pricing" },
                ].map((n) => (
                  <Link
                    key={n.label}
                    to={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {n.label} <ChevronRight className="w-4 h-4 opacity-60" />
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-8">
        {/* Decorative floating icons */}
        <div aria-hidden className="hidden md:block pointer-events-none">
          <motion.div
            className="absolute left-[6%] top-32 text-4xl"
            animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            🎁
          </motion.div>
          <motion.div
            className="absolute right-[8%] top-28 text-4xl"
            animate={{ y: [0, -14, 0], rotate: [3, -3, 3] }}
            transition={{ duration: 7, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute left-[15%] top-64 text-3xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            💐
          </motion.div>
          <motion.div
            className="absolute right-[18%] top-72 text-3xl"
            animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            🎂
          </motion.div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-purple-200 dark:border-purple-900/50 text-[#6d4aff] shadow-sm"
          >
            <Sparkles className="w-3 h-3" /> Premium Designs · Ready in Minutes
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display font-bold text-[40px] sm:text-[56px] lg:text-[76px] leading-[0.98] tracking-tight text-slate-900 dark:text-slate-50"
          >
            The <span className="text-gradient-primary italic">Template</span>{" "}
            <br className="hidden sm:block" />
            Collection you'll <span className="text-gradient-pink italic">love</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-[14px] sm:text-[16px] lg:text-[17px] text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {cat === "All"
              ? `Handcrafted digital wishes for every occasion — birthdays, weddings, festivals, milestones and more.`
              : `Beautiful ${cat} designs — pick, personalise, and make someone's day.`}
          </motion.p>

          {/* Stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
          >
            {[
              { v: templates.length, l: "Templates" },
              { v: "50K+", l: "Happy Users" },
              { v: "4.9★", l: "Rating" },
              { v: "120+", l: "Categories" },
            ].map((s, i) => (
              <div
                key={i}
                className="pl-1 pr-3.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-white/70 dark:border-slate-800 shadow-sm inline-flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-slate-900 dark:text-white">{s.v}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">{s.l}</span>
                </span>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-[560px] mx-auto relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] blur-xl opacity-40" />
            <div className="relative flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-full border border-white dark:border-slate-800 shadow-2xl overflow-hidden">
              <Search className="w-5 h-5 text-slate-400 ml-5" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search 'birthday' or 'wedding'…"
                data-testid="tpl-search"
                className="flex-1 h-14 pl-3 pr-4 bg-transparent outline-none text-[14.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="mr-2 w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category chip strip — colorful gradient pills */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2">
        <div className="overflow-x-auto scrollbar-thin -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 py-2 whitespace-nowrap">
            {catChips.map((c) => {
              const active = cat === c;
              const theme = CAT_THEME[c] || "from-slate-500 to-slate-700";
              return (
                <motion.button
                  key={c}
                  onClick={() => setCat(c)}
                  data-testid={`tpl-chip-${c}`}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative shrink-0 h-11 pl-4 pr-4 rounded-full font-semibold text-[13px] flex items-center gap-2 transition-all ${active ? `bg-gradient-to-r ${theme} text-white shadow-xl` : "bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-transparent hover:shadow-lg"}`}
                  style={{
                    boxShadow: active ? "0 12px 28px -8px rgba(109,74,255,0.5)" : undefined,
                  }}
                >
                  <span
                    className={`w-9 h-9 rounded-full grid place-items-center text-white text-[15px] ${active ? "bg-white/20 backdrop-blur" : `bg-gradient-to-br ${theme}`}`}
                  >
                    {c === "All" ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      {
                        Birthday: "🎂",
                        Anniversary: "💍",
                        Wedding: "💒",
                        Love: "💖",
                        "Baby Shower": "👶",
                        Festivals: "🎆",
                        Invitations: "💌",
                        Independence: "🇮🇳",
                        Diwali: "🪔",
                        Christmas: "🎄",
                        "New Year": "🎉",
                        More: "🎁",
                      }[c] || "✨"
                    )}
                  </span>
                  {c}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Filters:
            </span>
            {activeFilters.map((f, i) => (
              <button
                key={i}
                onClick={f.onClear}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 text-[#6d4aff] text-[11.5px] font-bold hover:bg-purple-50 shadow-sm"
                data-testid={`tpl-active-${f.k}`}
              >
                {f.v} <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-[11.5px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-24 flex gap-6 mt-4">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-[104px] rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-white dark:border-slate-800 shadow-xl shadow-purple-500/5 p-6 space-y-7 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/40 blur-2xl" />
            <div className="relative">
              <FilterGroups
                price={price}
                setPrice={setPrice}
                tier={tier}
                setTier={setTier}
                sort={sort}
                setSort={setSort}
              />
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Count + sort */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
              <span className="text-[18px] font-display">{filtered.length}</span> template
              {filtered.length !== 1 ? "s" : ""}
              {cat !== "All" && (
                <span className="text-slate-100 dark:text-slate-400 font-normall"> in {cat}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                data-testid="tpl-open-filters"
                className="lg:hidden h-9 px-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[12.5px] font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilters.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#6d4aff] text-white text-[10px] grid place-items-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-[12px] text-slate-100">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  data-testid="tpl-sort-select"
                  className="h-9 px-3 pr-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[12.5px] font-semibold focus:border-[#6d4aff] outline-none shadow-sm"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                >
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-dashed border-purple-200 dark:border-purple-900/40 shadow-xl">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center shadow-2xl shadow-purple-500/30">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="mt-5 font-display font-bold text-[24px] text-slate-900 dark:text-slate-100">
                Nothing matches — yet.
              </div>
              <div className="text-[13.5px] text-slate-500 mt-2 max-w-md mx-auto">
                We're constantly adding new designs. Try a different category or clear filters to
                see everything we have.
              </div>
              <button
                onClick={clearAll}
                data-testid="tpl-clear"
                className="inline-flex mt-6 h-12 px-7 rounded-full bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] text-white font-bold text-[13.5px] items-center gap-2 shadow-xl shadow-purple-500/30 hover:shadow-2xl transition"
              >
                Show all templates <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((t, i) => (
                <TemplateCard key={t.id} t={t} me={me} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 h-full w-[92%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
                <div className="font-display font-bold text-[17px]">Filters</div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <FilterGroups
                  price={price}
                  setPrice={setPrice}
                  tier={tier}
                  setTier={setTier}
                  sort={sort}
                  setSort={setSort}
                />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-bold text-[14px] shadow-lg shadow-purple-500/30"
                >
                  Show {filtered.length} template{filtered.length !== 1 ? "s" : ""}
                </button>
                <button
                  onClick={clearAll}
                  className="mt-2 w-full h-11 rounded-full text-slate-100 font-semibold text-[13px]"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SiteFooter />
    </div>
  );
}

function FilterGroups({ price, setPrice, tier, setTier, sort, setSort }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Diamond className="w-3 h-3" />
          Price Range
        </div>
        <ul className="space-y-1.5">
          {PRICE_BUCKETS.map((b) => {
            const active = price === b.id;
            return (
              <li key={b.id}>
                <button
                  onClick={() => setPrice(b.id)}
                  data-testid={`tpl-price-${b.id}`}
                  className={`group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${active ? "bg-gradient-to-r from-[#6d4aff]/10 to-[#ff5fa2]/10 text-[#6d4aff] ring-1 ring-purple-200 dark:ring-purple-900/50" : "text-slate-60 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full grid place-items-center transition ${active ? "bg-gradient-to-br from-[#6d4aff] to-[#8b5cf6]" : "border-2 border-slate-30 dark:border-slate-60 group-hover:border-purple-40"}`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <b.icon
                    className={`w-4 h-4 ${active ? "text-[#6d4aff]" : "text-slate-400 group-hover:text-slate-60"}`}
                  />
                  {b.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Award className="w-3 h-3" />
          Type
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "all", label: "All", c: "from-slate-700 to-slate-900" },
            { id: "free", label: "Free", c: "from-emerald-500 to-teal-60" },
            { id: "premium", label: "Premium", c: "from-amber-500 to-orange-600" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setTier(o.id)}
              data-testid={`tpl-tier-${o.id}`}
              className={`h-10 rounded-2xl text-[12px] font-bold transition-all ${tier === o.id ? `bg-gradient-to-r ${o.c} text-white shadow-lg` : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3" />
          Sort by
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          data-testid="tpl-sort-side"
          className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] outline-none text-[13px] font-semibold"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TemplateCard({ t, index }) {
  const navigate = useNavigate();
  return (
    <TemplatePricingCard
      t={t}
      variant="grid"
      onOpenPreview={(tpl) => navigate({ to: `/templates?preview=${tpl.id}`, search: (s) => s })}
      onOpenBuilder={(tpl) => navigate({ to: `/templates?builder=${tpl.id}`, search: (s) => s })}
    />
  );
}

export const Route = createFileRoute("/templates")({
  component: TemplatesShopPage,
});
