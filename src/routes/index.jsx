import { createFileRoute } from "@tanstack/react-router";
import { createWish } from "../lib/wish.functions";
import { useServerFn } from "@tanstack/react-start";
import { getBatchTemplateAccess } from "../lib/purchases.functions";
import { getTemplates } from "../lib/templates.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Search,
  Bell,
  ArrowRight,
  Star,
  Sparkles,
  Cake,
  Heart,
  Home,
  Baby,
  Sparkle,
  Mail,
  Flag,
  Flame,
  TreePine,
  PartyPopper,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Eye,
  ThumbsUp,
  ImageIcon,
  Pencil,
  Send,
  Zap,
  Smartphone,
  Shield,
  Crown,
  Users,
  FileText,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  ChevronDown,
  Check,
  Award,
  Globe,
  Wand2,
  Sun,
  Moon,
  X,
  Copy,
  ExternalLink,
  Loader2,
  Volume2,
  Mic,
  Menu,
  Gift,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { TemplatePricingCard } from "@/components/TemplatePricingCard";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/auth-client";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategoryBackgroundStyle } from "@/lib/category-display";
import { MediaPicker } from "@/components/MediaPicker";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/* ---------------- Global Wish Builder Context ---------------- */
import { createContext, useContext } from "react";
const WishCtx = createContext(null);
const useWish = () => useContext(WishCtx);

/* ---------------- Dark Mode Toggle ---------------- */
const DarkToggle = () => {
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
  );
};

/* ---------------- Unified Section Header Component ---------------- */
const SectionHeader = ({
  eyebrow,
  title,
  titleAccent,
  emoji,
  description,
  actionLabel,
  actionHref,
  actionTestId,
  eyebrowIcon: EyebrowIcon = Sparkles,
  eyebrowColor = "bg-purple-100/80 dark:bg-purple-900/40 text-[#5a39e6] dark:text-[#a58dff]",
  titleEmoji,
  align = "center",
}) => {
  return (
    <div
      className={`mb-8 sm:mb-12 ${align === "center" ? "text-center" : "flex flex-col md:flex-row md:items-end md:justify-between md:text-left gap-4"}`}
    >
      <div className={align === "center" ? "" : "max-w-2xl"}>
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${eyebrowColor} shadow-sm border border-white/20 dark:border-white/5 relative group`}
          >
            <EyebrowIcon className="w-3 h-3 transition-transform group-hover:rotate-12" />
            <span className="tracking-widest uppercase">{eyebrow}</span>
            <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 transition-opacity animate-pulse-glow" />
          </motion.div>
        )}

        <h2
          className={`font-display font-bold text-[clamp(26px,5vw,48px)] text-slate-900 dark:text-slate-100 mt-4 leading-[1.1] tracking-tight`}
        >
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-[0.25em]"
            >
              {word === titleAccent ? (
                <span className="text-gradient-pink italic">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
          {titleEmoji && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-block ml-2 align-middle text-[0.8em]"
            >
              {titleEmoji}
            </motion.span>
          )}
          {emoji && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-block ml-2"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff5fa2] fill-[#ff5fa2]" />
            </motion.span>
          )}
        </h2>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto md:mx-0"
          >
            {description}
          </motion.p>
        )}
      </div>

      {actionLabel && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className={align === "center" ? "mt-8" : "pb-2"}
        >
          <a
            href={actionHref}
            data-testid={actionTestId}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-[13px] hover:bg-slate-200 dark:hover:bg-slate-700 hover:gap-3 transition-all group shadow-sm border border-slate-200 dark:border-slate-700"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 text-[#5a39e6] dark:text-[#a58dff] transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      )}
    </div>
  );
};

/* ---------------- Header (Floating Pill Nav) ---------------- */
const Header = () => {
  const { site } = usePublicSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const wish = useWish();
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
  const nav = [
    { label: "Templates", href: "/templates" },
    { label: "Categories", href: "#categories" },
    { label: "How It Works", href: "#how" },
    { label: "Pricing", href: "/pricing" },
  ];
  const firstName = me?.name?.split(" ")[0] || "";
  return (
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
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0 min-w-0">
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
          </a>
          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 px-1 shrink-0">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="relative px-2.5 lg:px-3.5 py-2 text-[12px] lg:text-[13px] font-medium rounded-full text-slate-700 dark:text-slate-300 hover:text-[#6d4aff] hover:bg-purple-50/70 dark:hover:bg-purple-900/30 transition-all whitespace-nowrap"
              >
                {n.label}
              </a>
            ))}
          </nav>
          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Auth-aware */}
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
                  {firstName || "Account"}
                </span>
              </a>
            )}
            <DarkToggle />
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
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Auth block */}
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

              <nav className="mt-6 space-y-1">
                {nav.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
};

/* ---------------- Hero Phone Mockups ---------------- */
const PhoneCard = ({ children, className = "", style }) => (
  <div
    className={`relative rounded-[36px] overflow-hidden shadow-premium ${className}`}
    style={style}
  >
    <div className="absolute inset-0 rounded-[36px] ring-1 ring-white/60 pointer-events-none z-10" />
    {children}
  </div>
);

const BirthdayMockup = () => (
  <div className="relative h-full w-full bg-gradient-to-b from-[#3a1145] via-[#6b1f5e] to-[#c53a80] text-white">
    {/* sparkle dots */}
    {Array.from({ length: 4 }).map((_, i) => (
      <span
        key={i}
        className="absolute w-11 h-11 rounded-full bg-white/70"
        style={{
          left: `${(i * 37) % 95}%`,
          top: `${((i * 53) % 85) + 3}%`,
          opacity: 0.4 + (i % 5) * 0.1,
        }}
      />
    ))}
    {/* balloons */}
    <div className="absolute top-8 left-4 text-3xl">🎈</div>
    <div className="absolute top-6 right-6 text-4xl">🎈</div>
    <div className="absolute top-16 right-4 text-2xl">🎈</div>
    <div className="pt-10 px-5 text-center relative z-10">
      <div
        className="font-[cursive] text-[34px] leading-[1.05] font-bold"
        style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
      >
        Happy
        <br />
        Birthday!
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold">
        <Heart className="w-3 h-3 fill-pink-300 text-pink-300" /> Riya
      </div>
      <div className="mt-3 text-[11px] leading-tight opacity-90 px-3">
        Wishing you a day filled with
        <br />
        Smiles, Love & Happiness!
      </div>
      <button className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff5fa2] to-[#ff9f43] text-[11px] font-bold shadow-lg">
        Start Your Journey
      </button>
    </div>
    {/* cake */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[80px] leading-none">🎂</div>
    {/* gift bows corners */}
    <div className="absolute bottom-12 left-2 text-3xl">🎁</div>
    <div className="absolute bottom-16 right-2 text-2xl">🎁</div>
    {/* pager */}
    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-4 text-[10px] opacity-80">
      <button className="w-6 h-6 rounded-full bg-white/20 grid place-items-center">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <span>03 / 12</span>
      <button className="w-6 h-6 rounded-full bg-white/20 grid place-items-center">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const MemoriesMockup = () => (
  <div className="relative h-full w-full bg-gradient-to-b from-[#fff1f5] to-[#ffe4ec] p-3">
    <div className="text-center font-serif italic text-[16px] text-[#7a2b52] font-semibold mt-2">
      Our Memories
    </div>
    <div className="grid grid-cols-2 gap-1.5 mt-3">
      {[
        "from-pink-300 to-rose-400",
        "from-orange-300 to-pink-400",
        "from-fuchsia-300 to-purple-400",
        "from-amber-300 to-rose-400",
        "from-rose-300 to-pink-500",
        "from-purple-300 to-pink-400",
      ].map((g, i) => (
        <div
          key={i}
          className={`aspect-square rounded-md bg-gradient-to-br ${g} relative overflow-hidden`}
        >
          <div className="absolute inset-0 grid place-items-center text-2xl">
            {["👨‍👩", "👫", "👩‍❤️‍👨", "👬", "💑", "👨‍👩‍👧"][i]}
          </div>
        </div>
      ))}
    </div>
    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-3 text-[10px] text-[#7a2b52]">
      <button className="w-5 h-5 rounded-full bg-white grid place-items-center shadow">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <span>03 / 12</span>
      <button className="w-5 h-5 rounded-full bg-white grid place-items-center shadow">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const MessageMockup = () => (
  <div className="relative h-full w-full bg-gradient-to-b from-[#fff2f6] to-[#ffe0eb] p-3">
    <div
      className="text-center italic text-[13px] font-semibold text-[#c1487a]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      Special Message
    </div>
    <div className="mt-2 rounded-lg bg-white/70 border border-pink-200 p-3 relative">
      <div className="absolute -top-1 -left-1 text-lg">🌸</div>
      <div className="absolute -bottom-1 -right-1 text-lg">🌸</div>
      <p className="text-[10px] leading-snug text-slate-700 italic text-center">
        May this year bring you
        <br />
        endless happiness,
        <br />
        success and lots of
        <br />
        beautiful moments.
        <br />
        <br />
        Stay happy always! ❤️
      </p>
    </div>
    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-3 text-[10px] text-[#c1487a]">
      <button className="w-5 h-5 rounded-full bg-white grid place-items-center shadow">
        <ChevronLeft className="w-3 h-3" />
      </button>
      <span>06 / 12</span>
      <button className="w-5 h-5 rounded-full bg-white grid place-items-center shadow">
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const ThankYouMockup = () => (
  <div className="relative h-full w-full bg-gradient-to-b from-[#fff1f5] to-[#ffe4ec] p-2 text-center">
    <div
      className="mt-3 italic text-[13px] font-bold text-[#c1487a]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      Thank You
    </div>
    <p className="mt-1 text-[10px] text-slate-700">
      You are truly
      <br />
      special!
    </p>
    <div className="mt-3 text-[54px] leading-none">🎁</div>
    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-between px-2 text-[9px] text-[#c1487a]">
      <button className="w-4 h-4 rounded-full bg-white grid place-items-center shadow">
        <ChevronLeft className="w-2.5 h-2.5" />
      </button>
      <span>12 / 12</span>
      <button className="w-4 h-4 rounded-full bg-white grid place-items-center shadow">
        <ChevronRight className="w-2.5 h-2.5" />
      </button>
    </div>
  </div>
);

const HeroMockups = () => {
  const wrapRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 100, damping: 50 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 100, damping: 50 });
  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };
  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-[380px] sm:h-[500px] lg:h-[560px] w-full flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-6 top-6 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#ff5fa2]/25 blur-3xl animate-drift" />
        <div className="absolute left-0 bottom-6 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#8b5cf6]/25 blur-3xl animate-drift" />
        <div className="absolute right-1/3 top-1/3 w-40 h-40 rounded-full bg-[#ff9f43]/20 blur-3xl" />
      </div>
      {/* Floating cute emoji stickers */}
      <img
        src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png"
        alt=""
        className="absolute left-2 top-6 w-14 sm:w-20 animate-floaty drop-shadow-2xl"
        style={{ animationDelay: "0.2s" }}
      />
      <img
        src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png"
        alt=""
        className="absolute right-4 top-10 w-14 sm:w-20 animate-floaty-slow drop-shadow-2xl"
        style={{ animationDelay: "0.5s" }}
      />
      <img
        src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Balloon/3D/balloon_3d.png"
        alt=""
        className="absolute right-2 bottom-16 w-12 sm:w-16 animate-floaty drop-shadow-2xl"
        style={{ animationDelay: "1s" }}
      />
      <img
        src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkling%20heart/3D/sparkling_heart_3d.png"
        alt=""
        className="absolute left-8 bottom-8 w-10 sm:w-14 animate-floaty-slow drop-shadow-2xl"
        style={{ animationDelay: "0.8s" }}
      />
      <img
        src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png"
        alt=""
        className="absolute right-16 bottom-4 w-10 sm:w-14 animate-floaty drop-shadow-2xl"
        style={{ animationDelay: "1.5s" }}
      />

      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative w-[320px] sm:w-[440px] max-w-full h-[340px] sm:h-[460px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0 rounded-[36px] overflow-hidden shadow-premium ring-8 ring-white/70 dark:ring-slate-800/70"
          style={{ transform: "translateZ(60px)" }}
        >
          <img
            src="https://images.pexels.com/photos/15863496/pexels-photo-15863496.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Digital wishes"
            className="w-full h-full object-cover animate-floaty"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />
        </motion.div>
        {/* Little glass stat card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -left-2 sm:-left-6 top-8 rounded-2xl glass border border-white shadow-xl p-2.5 sm:p-3 flex items-center gap-2"
          style={{ transform: "translateZ(90px)" }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#ff5fa2] to-[#c93aff] grid place-items-center">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">Happy Users</div>
            <div className="text-sm sm:text-base font-bold text-slate-900">50,000+</div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute -right-2 sm:-right-6 bottom-4 rounded-2xl glass border border-white shadow-xl p-2.5 sm:p-3 flex items-center gap-2"
          style={{ transform: "translateZ(90px)" }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] text-slate-500">Rating</div>
            <div className="text-sm sm:text-base font-bold text-slate-900">4.9 / 5</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------------- Viral 3D Scroll Hero ---------------- */
const Hero = () => {
  const wish = useWish();
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const { scrollYProgress: rawProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // Buttery-smooth spring on scroll progress
  const scrollYProgress = useSpring(rawProgress, {
    stiffness: 100,
    damping: 60,
    mass: 0.35,
    restDelta: 0.001,
  });

  // Mouse tilt on 3D stage
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 100, damping: 50 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 100, damping: 50 });

  // Text (Scene 1) scroll transforms - slightly reduced Y travel for shorter viewports
  const headY = useTransform(scrollYProgress, [0, 0.55], [0, -100]);
  const headScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.8]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.45, 0.6], [1, 1, 0]);
  const subOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);

  // Gift box (centerpiece) transforms
  const giftRotY = useTransform(scrollYProgress, [0, 1], [0, 540]);
  const giftRotX = useTransform(scrollYProgress, [0, 1], [-6, 22]);
  const giftScale = useTransform(scrollYProgress, [0, 0.35, 0.6, 1], [0.9, 1.05, 0.9, 0.5]);
  const giftY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const giftOpacity = useTransform(scrollYProgress, [0.65, 0.85], [1, 0.15]);

  // Cards fanning out of the box
  const card1Opacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const card1X = useTransform(scrollYProgress, [0.35, 0.85], [0, -140]);
  const card1Y = useTransform(scrollYProgress, [0.35, 0.85], [0, -20]);
  const card1Rot = useTransform(scrollYProgress, [0.35, 0.9], [0, -14]);
  const card2Opacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.4, 0.85], [0, -60]);
  const card2Scale = useTransform(scrollYProgress, [0.4, 0.85], [0.6, 1.0]);
  const card3Opacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const card3X = useTransform(scrollYProgress, [0.45, 0.85], [0, 140]);
  const card3Y = useTransform(scrollYProgress, [0.45, 0.85], [0, -20]);
  const card3Rot = useTransform(scrollYProgress, [0.45, 0.9], [0, 14]);

  // Floating parallax
  const balloonY1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const balloonY2 = useTransform(scrollYProgress, [0, 1], [0, -320]);
  const emoji1Y = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const emoji2Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const emoji3Y = useTransform(scrollYProgress, [0, 1], [0, -280]);

  // Final CTA appears
  const finalOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const finalY = useTransform(scrollYProgress, [0.7, 0.95], [30, 0]);

  useEffect(() => {
    const onMove = (e) => {
      const r = stageRef.current?.getBoundingClientRect();
      if (!r) return;
      mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    const stage = stageRef.current;
    stage?.addEventListener("mousemove", onMove);
    stage?.addEventListener("mouseleave", onLeave);
    return () => {
      stage?.removeEventListener("mousemove", onMove);
      stage?.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  // Confetti particles (memoized-ish) - Now hollow hearts, stars and sparkles
  const confetti = Array.from({ length: 32 }).map((_, i) => {
    const colors = [
      "#FFB7C5",
      "#FF7F50",
      "#A855F7",
      "#E9D5FF",
      "#FBBF24",
      "#60A5FA",
      "#34D399",
      "#FB923C",
    ];
    const shapes = ["♡", "☆", "✧"];
    return {
      c: colors[i % colors.length],
      left: (i * 137) % 100,
      top: (i * 53) % 80,
      size: 14 + (i % 6) * 4,
      delay: (i % 8) * 0.45,
      dur: 4 + (i % 6),
      shape: shapes[i % shapes.length],
      rotate: (i * 45) % 360,
      x: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 15),
    };
  });

  return (
    <section
      ref={containerRef}
      className="relative h-[165svh] hero-bg sm:h-[200vh]"
      data-testid="home-hero"
    >
      {/* Pinned viewport - Using dvh for better mobile support and min-height for content safety */}
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden sm:h-[100dvh] sm:min-h-[600px]">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-6 top-20 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-[#ff5fa2]/25 blur-3xl animate-drift" />
          <div
            className="absolute left-0 bottom-6 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-[#8b5cf6]/25 blur-3xl animate-drift"
            style={{ animationDelay: "2s" }}
          />
          <div className="absolute right-1/3 top-1/3 w-56 h-56 rounded-full bg-[#ff9f43]/20 blur-3xl" />
          {/* Soft mesh grid */}
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.09]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,15,25,0.6) 1px, transparent 0)",
              backgroundSize: "34px 34px",
            }}
          />
        </div>

        {/* Confetti drift — Now hollow doodles (Hearts, Stars, Sparkles) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((p, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, opacity: 0, x: 0, rotate: p.rotate }}
              animate={{
                y: [-50, 900],
                opacity: [0, 0.7, 0.6, 0],
                rotate: [p.rotate, p.rotate + 360],
                x: [0, p.x, 0, -p.x, 0],
              }}
              transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                color: p.c,
                fontSize: p.size,
              }}
              className="absolute select-none pointer-events-none font-medium opacity-60 hidden sm:block"
            >
              {p.shape}
            </motion.div>
          ))}
          {/* Mobile version — fewer and smaller */}
          {confetti.slice(0, 12).map((p, i) => (
            <motion.div
              key={`m-${i}`}
              initial={{ y: -30, opacity: 0, x: 0, rotate: p.rotate }}
              animate={{
                y: [-30, 800],
                opacity: [0, 0.6, 0.5, 0],
                rotate: [p.rotate, p.rotate + 180],
                x: [0, p.x / 2, 0],
              }}
              transition={{ duration: p.dur + 1, repeat: Infinity, delay: p.delay, ease: "linear" }}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                color: p.c,
                fontSize: p.size * 0.7,
              }}
              className="absolute select-none pointer-events-none font-medium opacity-50 sm:hidden"
            >
              {p.shape}
            </motion.div>
          ))}
        </div>

        {/* Floating 3D parallax stickers */}
        <motion.img
          style={mounted ? { y: emoji1Y } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Balloon/3D/balloon_3d.png"
          className="absolute left-[5%] top-[16%] w-14 sm:w-24 drop-shadow-2xl animate-floaty pointer-events-none select-none"
          alt=""
        />
        <motion.img
          style={mounted ? { y: emoji2Y } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png"
          className="absolute right-[7%] top-[20%] w-14 sm:w-24 drop-shadow-2xl animate-floaty-slow pointer-events-none select-none"
          alt=""
        />
        <motion.img
          style={mounted ? { y: emoji3Y } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkling%20heart/3D/sparkling_heart_3d.png"
          className="absolute left-[10%] bottom-[16%] w-12 sm:w-20 drop-shadow-2xl animate-floaty pointer-events-none select-none"
          alt=""
        />
        <motion.img
          style={mounted ? { y: balloonY1 } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Balloon/3D/balloon_3d.png"
          className="absolute right-[6%] bottom-[14%] w-14 sm:w-24 drop-shadow-2xl animate-floaty-slow pointer-events-none select-none"
          alt=""
        />
        <motion.img
          style={mounted ? { y: balloonY2 } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png"
          className="absolute right-[16%] top-[6%] w-10 sm:w-16 drop-shadow-2xl animate-floaty pointer-events-none select-none"
          alt=""
        />
        <motion.img
          style={mounted ? { y: emoji2Y } : undefined}
          src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rose/3D/rose_3d.png"
          className="absolute left-[16%] top-[8%] w-9 sm:w-14 drop-shadow-2xl animate-floaty-slow pointer-events-none select-none hidden sm:block"
          alt=""
        />

        {/* Text content layer — sits behind 3D stage but readable */}
        <div className="relative z-10 h-full w-full">
          <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-12 pt-[clamp(80px,10vh,120px)] pb-12 sm:pb-16">
            <div className="h-full flex flex-col items-center justify-between text-center relative py-4 sm:py-8">
              {/* Chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                style={mounted ? { opacity: subOpacity } : undefined}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/70 shadow-lg mb-[clamp(8px,2vh,24px)] shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse-glow" />
                <span className="text-[clamp(10px,1.2vw,12px)] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Create · Personalize · Share the Joy
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#ff9f43]" />
              </motion.div>

              {/* Headline — Create Beautiful on line 1 */}
              <motion.h1
                style={mounted ? { scale: headScale, y: headY, opacity: headOpacity } : undefined}
                className="font-display font-bold text-[clamp(32px,6vw,84px)] leading-[1] tracking-tight text-slate-900 dark:text-slate-50 max-w-5xl shrink-0"
              >
                Create <span className="text-gradient-primary">Beautiful</span>
              </motion.h1>

              {/* Digital [gift] Wishes — gift anchored exactly between the two words */}
              <div className="relative w-full flex items-center justify-center mt-[clamp(4px,1vh,12px)] px-2 sm:px-4 shrink-0 overflow-visible">
                <motion.div
                  style={mounted ? { scale: headScale, y: headY, opacity: headOpacity } : undefined}
                  className="w-full flex items-center justify-center gap-1 sm:gap-2"
                >
                  <div className="flex-1 flex justify-end overflow-visible">
                    <motion.span
                      initial={{ x: -120, opacity: 0, rotate: -6 }}
                      animate={{ x: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.55, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                      className="font-script italic text-gradient-pink text-[clamp(32px,8vw,104px)] leading-[1.3] py-2 sm:py-4 px-4 sm:px-8 whitespace-nowrap select-none drop-shadow-[0_4px_20px_rgba(255,95,162,0.35)]"
                    >
                      Digital
                    </motion.span>
                  </div>
                  {/* Reserved horizontal space for the gift centerpiece */}
                  <div className="w-[clamp(60px,15vw,200px)] shrink-0" aria-hidden="true" />
                  <div className="flex-1 flex justify-start overflow-visible">
                    <motion.span
                      initial={{ x: 120, opacity: 0, rotate: 0 }}
                      animate={{ x: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.75, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                      className="font-script italic text-gradient-pink text-[clamp(32px,8vw,104px)] leading-[1.3] py-2 sm:py-4 px-4 sm:px-8 whitespace-nowrap select-none drop-shadow-[0_4px_20px_rgba(255,95,162,0.35)]"
                    >
                      Wishes
                    </motion.span>
                  </div>
                </motion.div>

                {/* Gift centerpiece — plain wrapper centers it; motion.div does scroll animation */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <motion.div
                    style={
                      mounted
                        ? {
                            scale: giftScale,
                            y: giftY,
                            rotateX: giftRotX,
                            rotateY: giftRotY,
                            opacity: giftOpacity,
                            transformStyle: "preserve-3d",
                          }
                        : { transformStyle: "preserve-3d" }
                    }
                    className="relative will-change-transform"
                  >
                    {/* Glow halo */}
                    <div className="absolute inset-0 -m-6 sm:-m-8 rounded-full bg-gradient-to-br from-[#ff5fa2]/40 via-[#8b5cf6]/40 to-[#ff9f43]/40 blur-3xl animate-pulse-glow" />
                    <img
                      src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png"
                      alt="Gift"
                      className="relative w-[clamp(70px,18vw,200px)] drop-shadow-[0_30px_50px_rgba(109,74,255,0.45)] select-none"
                    />
                    {/* Orbiting sparkles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 grid place-items-center"
                    >
                      <div className="relative w-[clamp(120px,30vw,280px)] h-[clamp(120px,30vw,280px)]">
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl sm:text-3xl">
                          ✨
                        </span>
                        <span className="absolute top-1/2 -right-2 -translate-y-1/2 text-xl sm:text-3xl">
                          💫
                        </span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl sm:text-3xl">
                          ⭐
                        </span>
                        <span className="absolute top-1/2 -left-2 -translate-y-1/2 text-xl sm:text-3xl">
                          ✨
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Sub + CTA */}
              <motion.p
                style={mounted ? { opacity: subOpacity } : undefined}
                className="mt-[clamp(12px,2vh,28px)] text-[clamp(13px,1.5vw,16px)] leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl whitespace-pre-wrap shrink-0 px-4"
              >
                Transform your heartfelt messages into magical digital experiences. Choose a
                template, customize with photos and music, and share the joy with your loved ones
                instantly.
              </motion.p>

              <motion.div
                style={mounted ? { opacity: subOpacity } : undefined}
                className="mt-[clamp(16px,2.5vh,32px)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 px-4"
              >
                <motion.button
                  data-testid="open-wish-builder"
                  onClick={() => wish?.openBuilder?.()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="group h-12 sm:h-14 px-6 sm:px-8 rounded-full text-white font-semibold text-[14px] sm:text-[15px] bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] btn-glow inline-flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Create Your Wish
                  </span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition" />
                  <span className="absolute inset-0 shimmer opacity-40" />
                </motion.button>
                <motion.button
                  onClick={() =>
                    document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-white/85 dark:bg-slate-800/80 backdrop-blur border border-slate-200/70 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-[14px] sm:text-[15px] shadow-soft inline-flex items-center justify-center gap-2 hover:border-purple-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Ratings */}
              <motion.div
                style={mounted ? { opacity: subOpacity } : undefined}
                className="mt-[clamp(16px,2.5vh,32px)] flex items-center gap-3 sm:gap-4 shrink-0"
              >
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
                    "https://images.pexels.com/photos/6311668/pexels-photo-6311668.jpeg?w=80&h=80&fit=crop",
                  ].map((s, i) => (
                    <img
                      key={i}
                      src={s}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                      alt="user"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="ml-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      4.9
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400">
                    Loved by 50,000+ users worldwide
                  </div>
                </div>
              </motion.div>

              {/* Scroll indicator - Moved to the RIGHT for Desktop/Large screens to avoid overlap with CTA buttons */}
              <motion.div
                style={mounted ? { opacity: subOpacity } : undefined}
                className="hidden lg:flex absolute right-[clamp(20px,5vw,80px)] bottom-[clamp(40px,10vh,120px)] flex-col items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 z-30"
              >
                <span className="tracking-wider uppercase [writing-mode:vertical-lr] rotate-180">
                  Scroll to unwrap
                </span>
                <div className="w-5 h-8 rounded-full border-2 border-slate-400/60 dark:border-slate-500/60 grid place-items-start p-1">
                  <motion.span
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-1 h-2 rounded-full bg-gradient-to-b from-[#6d4aff] to-[#ff5fa2]"
                  />
                </div>
              </motion.div>

              {/* Mobile/Tablet Scroll indicator - Stays centered but positioned at the bottom edge to avoid overlap with CTA group */}
              <motion.div
                style={mounted ? { opacity: subOpacity } : undefined}
                className="lg:hidden absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 z-10"
              >
                <span className="tracking-wider uppercase">Scroll to unwrap</span>
                <div className="w-5 h-8 rounded-full border-2 border-slate-400/60 dark:border-slate-500/60 grid place-items-start p-1">
                  <motion.span
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-1 h-2 rounded-full bg-gradient-to-b from-[#6d4aff] to-[#ff5fa2]"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 3D Stage overlay */}
        <div
          ref={stageRef}
          className="pointer-events-none absolute inset-0 grid place-items-center z-20"
          style={{ perspective: "1400px" }}
        >
          <div className="relative w-full h-full grid place-items-center">
            {/* Fanning cards — reveal on scroll */}
            <motion.div
              style={
                mounted
                  ? { opacity: card1Opacity, x: card1X, y: card1Y, rotate: card1Rot }
                  : { opacity: 0 }
              }
              className="absolute pointer-events-auto"
            >
              <div className="w-[clamp(130px,20vw,200px)] aspect-[3/4] rounded-3xl overflow-hidden shadow-premium ring-4 ring-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#3a1145] via-[#7b1f7a] to-[#c53a80]" />
                {/* dots */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute w-11 h-11 rounded-full bg-white/70"
                    style={{
                      left: `${(i * 37) % 92}%`,
                      top: `${((i * 53) % 80) + 5}%`,
                      opacity: 0.4 + (i % 4) * 0.15,
                    }}
                  />
                ))}
                <div className="relative h-full flex flex-col p-3 text-white">
                  <div className="font-display font-bold text-[22px] sm:text-[28px] leading-[1.02] italic">
                    Happy
                    <br />
                    Birthday!
                  </div>
                  <div className="mt-1 text-[11px] font-script text-[15px] opacity-95">
                    For your loved one
                  </div>
                  <div className="mt-auto text-[48px] leading-none text-center drop-shadow-lg">
                    🎂
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={
                mounted
                  ? {
                      opacity: card2Opacity,
                      y: card2Y,
                      scale: card2Scale,
                      rotateX: rx,
                      rotateY: ry,
                      transformStyle: "preserve-3d",
                    }
                  : { opacity: 0, transformStyle: "preserve-3d" }
              }
              className="absolute z-30 pointer-events-auto"
            >
              <div className="w-[clamp(150px,24vw,230px)] aspect-[3/4] rounded-3xl overflow-hidden shadow-premium ring-4 ring-white relative">
                <img
                  src="https://images.pexels.com/photos/15211704/pexels-photo-15211704.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/10 to-transparent" />
                <div className="absolute inset-x-0 top-2 flex justify-center">
                  <div className="px-2 py-0.5 rounded-full bg-white/90 text-[9px] font-bold text-[#6d4aff]">
                    ✨ POPULAR
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 text-white text-left">
                  <div className="font-display font-bold text-[18px] sm:text-[20px] leading-tight">
                    Beautiful Moments
                  </div>
                  <div className="text-[11px] font-script text-[15px] opacity-95">
                    memories to keep
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={
                mounted
                  ? { opacity: card3Opacity, x: card3X, y: card3Y, rotate: card3Rot }
                  : { opacity: 0 }
              }
              className="absolute pointer-events-auto"
            >
              <div className="w-[clamp(130px,20vw,200px)] aspect-[3/4] rounded-3xl overflow-hidden shadow-premium ring-4 ring-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fff1e6] via-[#ffd6b0] to-[#ff9f43]" />
                <div className="relative h-full flex flex-col p-3 text-[#7a2b52]">
                  <div className="font-display font-bold text-[22px] sm:text-[26px] leading-[1.02] italic">
                    Save The
                    <br />
                    Date
                  </div>
                  <div className="mt-1 text-[11px] font-script text-[15px] opacity-90">
                    Wedding invite
                  </div>
                  <div className="mt-auto text-[48px] leading-none text-center drop-shadow-lg">
                    💐
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gift centerpiece moved into the Digital/Wishes headline row (anchored between the words) */}
          </div>
        </div>

        {/* Final CTA at end of scroll */}
        <motion.div
          style={mounted ? { opacity: finalOpacity, y: finalY } : { opacity: 0 }}
          className="absolute inset-x-0 bottom-[clamp(24px,6vh,56px)] text-center pointer-events-none z-30 px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/70 text-[11px] font-semibold text-slate-700 dark:text-slate-100 mb-3">
            <Gift className="w-3.5 h-3.5 text-[#ff5fa2]" /> Your gift is ready
          </div>
          <div className="font-display font-bold text-[24px] sm:text-[36px] lg:text-[44px] text-slate-900 dark:text-slate-50 tracking-tight">
            Ready to <span className="text-gradient-primary">unwrap</span> your creativity?
          </div>
          <motion.button
            onClick={() => wish?.openBuilder?.()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="pointer-events-auto mt-4 h-12 sm:h-14 px-7 sm:px-9 rounded-full text-white font-bold text-[14px] sm:text-[15px] bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] btn-glow inline-flex items-center gap-2 shadow-2xl relative overflow-hidden"
          >
            <Sparkles className="w-4 h-4" />
            Start Creating Free
            <ArrowRight className="w-4 h-4" />
            <span className="absolute inset-0 shimmer opacity-40" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------------- Categories ---------------- */
const Categories = () => {
  const [cats, setCats] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/categories", { cache: "no-store", signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Categories request failed (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d.items)) throw new Error("Invalid categories response");
        setCats(d.items);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);
  return (
    <section
      id="categories"
      data-testid="home-categories"
      className="relative bg-white py-12 dark:bg-slate-950 sm:py-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          eyebrow="Browse by mood"
          title="Explore Categories"
          titleAccent="Categories"
          description="Pick a moment to celebrate — 120+ beautiful themes await"
        />
        <div
          className="grid grid-cols-2 gap-4 min-[390px]:grid-cols-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-6"
          data-testid="homepage-categories-grid"
        >
          {status === "loading" &&
            Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="aspect-square rounded-[26px] bg-slate-100 dark:bg-slate-800 animate-pulse"
                aria-hidden="true"
              />
            ))}
          {cats.map((c, i) => (
            <motion.a
              key={c.name}
              href={`/templates?category=${encodeURIComponent(c.name)}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.97 }}
              className="group relative cursor-pointer"
              data-testid={`cat-link-${c.name}`}
            >
              {/* Hover glow halo */}
              <div
                className="absolute -inset-1 rounded-[30px] opacity-0 group-hover:opacity-70 blur-2xl transition-opacity duration-500"
                style={getCategoryBackgroundStyle(c.bg)}
              />
              {/* Gradient border wrapper */}
              <div className="relative aspect-square rounded-[26px] p-[1.5px] bg-gradient-to-br from-white/90 via-white/40 to-white/10 dark:from-white/15 dark:via-white/5 dark:to-transparent shadow-[0_10px_30px_-12px_rgba(80,60,160,0.35)] group-hover:shadow-[0_24px_50px_-16px_rgba(109,74,255,0.5)] transition-all duration-500">
                <div
                  className="relative h-full w-full rounded-[25px] overflow-hidden dark:bg-slate-800"
                  style={getCategoryBackgroundStyle(c.bg)}
                >
                  {/* Depth lights */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/50 dark:bg-white/10 blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] to-transparent dark:from-black/30" />
                  {/* Icon pedestal */}
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative grid place-items-center w-[64%] h-[64%] rounded-full bg-white/55 dark:bg-white/10 backdrop-blur-md ring-1 ring-white/70 dark:ring-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.6),0_12px_26px_-12px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-500">
                      <CategoryIcon
                        value={c.img}
                        name={c.name}
                        imageClassName="w-[62%] h-[62%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.28)] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
                        emojiClassName="text-4xl sm:text-5xl drop-shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  {/* Shine sweep */}
                  <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[420%] transition-all duration-[900ms] ease-out" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-[12px] sm:text-[14px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {c.name}
                </div>
                <div className="mt-0.5 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-[#6d4aff] opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        {status === "ready" && cats.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500" role="status">
            No categories are currently available.
          </p>
        )}
        {status === "error" && (
          <p className="py-8 text-center text-sm text-rose-600" role="alert">
            Categories could not be loaded. Please try again shortly.
          </p>
        )}
        <div className="mt-8 text-center">
          <a
            href="/templates"
            data-testid="view-all-categories"
            className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            View All 120+ Categories <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
const CategoriesLegacy = () => (
  <section className="hidden">
    <div>legacy</div>
  </section>
);

/* ---------------- Trending Templates ---------------- */
const DEFAULT_TEMPLATES = [
  {
    title: "Birthday Celebration",
    pages: 12,
    badge: "Popular",
    label: "Happy Birthday",
    sub: "For your loved one",
    photo:
      "https://images.pexels.com/photos/15211704/pexels-photo-15211704.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    title: "Wedding Invitation",
    pages: 12,
    badge: "Popular",
    label: "Wedding Bells",
    sub: "Save the date",
    photo:
      "https://images.pexels.com/photos/32705154/pexels-photo-32705154.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    title: "Anniversary Wishes",
    pages: 10,
    badge: "New",
    label: "Happy Anniversary",
    sub: "Forever together",
    photo: "https://images.unsplash.com/photo-1589095181425-c038b3871b6a?w=500&fit=crop",
  },
  {
    title: "Independence Day",
    pages: 8,
    badge: "Trending",
    label: "Jai Hind",
    sub: "Vande Mataram",
    photo:
      "https://images.pexels.com/photos/30649312/pexels-photo-30649312.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    title: "Christmas Wishes",
    pages: 10,
    badge: "New",
    label: "Merry Christmas",
    sub: "Ho Ho Ho!",
    photo:
      "https://images.pexels.com/photos/724375/pexels-photo-724375.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    title: "Baby Shower",
    pages: 10,
    badge: "Popular",
    label: "Baby Shower",
    sub: "A little one coming",
    photo:
      "https://images.pexels.com/photos/1682459/pexels-photo-1682459.jpeg?auto=compress&cs=tinysrgb&w=500",
  },
  {
    title: "New Year 2026",
    pages: 8,
    badge: "",
    label: "Happy New Year",
    sub: "Cheers to 2026",
    photo: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=500&fit=crop",
  },
  {
    title: "Grand Opening",
    pages: 10,
    badge: "New",
    label: "Grand Opening",
    sub: "Big day!",
    photo: "https://images.unsplash.com/photo-1761475456154-6c5373bbd2bb?w=500&fit=crop",
  },
];
const TemplateCard = ({ t }) => {
  const wish = useWish();
  return (
    <TemplatePricingCard
      t={t}
      variant="grid"
      onOpenPreview={(tpl) => wish?.openPreview?.(tpl)}
      onOpenBuilder={(tpl) => wish?.openBuilder?.(tpl)}
    />
  );
};

const Trending = () => {
  const [tpls, setTpls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);

  const fetchTemplates = useServerFn(getTemplates);
  const fetchBatchAccess = useServerFn(getBatchTemplateAccess);
  const queryClient = useQueryClient();
  const wish = useWish();

  const loadTemplates = async (currentOffset, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await fetchTemplates({ data: { offset: currentOffset, limit: 10 } });
      if (res) {
        const newItems = res.items || [];
        const combined = isInitial ? newItems : [...tpls, ...newItems];
        setTpls(combined);
        setHasMore(res.hasMore);
        setOffset(res.nextOffset || currentOffset);

        // Batch access lookup for visible templates
        if (newItems.length > 0) {
          fetchBatchAccess({
            data: { templateIds: newItems.map((t) => t.id) },
            headers: await getAuthHeaders(),
          })
            .then((accessRes) => {
              if (accessRes?.results) {
                accessRes.results.forEach((item) => {
                  queryClient.setQueryData(["template-access", item.templateId], item);
                });
              }
            })
            .catch((err) => console.error("Batch access error:", err));
        }
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError("Unable to load templates. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadTemplates(0, true);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadTemplates(offset);
    }
  };

  if (loading) {
    return (
      <section
        id="templates"
        className="relative py-12 sm:py-16 bg-gradient-to-b from-white to-purple-50/30 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6d4aff]" />
          <p className="mt-4 text-slate-500">Loading premium templates...</p>
        </div>
      </section>
    );
  }

  if (!loading && tpls.length === 0) {
    return (
      <section
        id="templates"
        className="relative py-12 sm:py-16 bg-gradient-to-b from-white to-purple-50/30 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            No trending templates available right now
          </h2>
          <p className="mt-2 text-slate-500">Check back later for fresh new designs!</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="templates"
      data-testid="home-trending"
      className="relative overflow-hidden bg-gradient-to-b from-white to-purple-50/30 py-12 dark:from-slate-950 dark:to-slate-900 sm:py-16"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          align="left"
          eyebrow="Hot right now"
          eyebrowIcon={Flame}
          eyebrowColor="bg-pink-100 dark:bg-pink-900/40 text-[#ff5fa2]"
          title="Trending Templates"
          titleEmoji="🔥"
          actionLabel="View All Templates"
          actionHref="/templates"
          actionTestId="view-all-templates"
        />

        <div className="mt-6 sm:mt-12">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500 sm:hidden">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            Swipe to explore
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
          <div
            data-testid="mobile-template-rail"
            className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {tpls.map((t) => (
              <div
                key={t.id}
                className="w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-full sm:max-w-none"
              >
                <TemplateCard t={t} />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-8 text-center">
              <p className="text-rose-500 text-sm mb-3">{error}</p>
              <Button
                onClick={() => loadTemplates(offset)}
                variant="outline"
                className="rounded-full px-6"
              >
                Retry Loading
              </Button>
            </div>
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group relative px-8 py-6 h-auto rounded-full bg-gradient-to-r from-[#6d4aff] to-[#ff5fa2] text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Templates...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Load More Templates
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ---------------- How It Works ---------------- */
const STEPS = [
  {
    n: 1,
    title: "Choose Template",
    desc: "Browse our wide range of beautiful templates for  occasion.",
    color: "from-[#6d4aff] to-[#8b5cf6]",
    bg: "from-purple-50 to-white",
    icon: ImageIcon,
  },
  {
    n: 2,
    title: "Add Your Content",
    desc: "Add your photos, messages and details to make it personal.",
    color: "from-[#ff5fa2] to-[#ff9f43]",
    bg: "from-pink-50 to-white",
    icon: Pencil,
  },
  {
    n: 3,
    title: "Share & Celebrate",
    desc: "Get your unique link and share with your loved ones instantly.",
    color: "from-[#ff9f43] to-[#facc15]",
    bg: "from-orange-50 to-white",
    icon: Share2,
  },
];
const HowItWorks = () => (
  <section
    id="how"
    data-testid="home-how"
    className="relative py-14 sm:py-20 bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
  >
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
      <SectionHeader
        eyebrow="Super simple"
        eyebrowIcon={Zap}
        eyebrowColor="bg-orange-100/80 dark:bg-orange-900/40 text-[#e68a2e] dark:text-[#ffb366]"
        title="How It Works?"
        titleEmoji="❤️"
        description="Create your beautiful wishes website in just 3 simple steps"
      />
      <div className="mt-10 sm:mt-12 grid md:grid-cols-3 gap-5 sm:gap-8 relative">
        <svg
          className="hidden md:block absolute left-[28%] top-16 w-[22%] h-16"
          viewBox="0 0 200 60"
          fill="none"
        >
          <path
            d="M4 40 C 60 -10, 140 -10, 196 40"
            stroke="#c4b5fd"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <path
            d="M188 33 L 196 40 L 188 47"
            stroke="#c4b5fd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="hidden md:block absolute left-[62%] top-16 w-[22%] h-16"
          viewBox="0 0 200 60"
          fill="none"
        >
          <path
            d="M4 40 C 60 -10, 140 -10, 196 40"
            stroke="#fbcfe8"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
          <path
            d="M188 33 L 196 40 L 188 47"
            stroke="#fbcfe8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            whileHover={{ y: -4 }}
            className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b ${s.bg} dark:from-slate-800 dark:to-slate-900 border border-white dark:border-slate-800 shadow-soft`}
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-md grid place-items-center relative`}
            >
              <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600 dark:text-slate-300" />
              <div
                className={`absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${s.color} text-white text-xs sm:text-sm font-bold grid place-items-center shadow-lg`}
              >
                {s.n}
              </div>
            </div>
            <h3 className="mt-5 sm:mt-6 font-display font-bold text-[18px] sm:text-[20px] text-slate-900 dark:text-slate-100">
              {s.title}
            </h3>
            <p className="mt-2 text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-400 leading-relaxed">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- Why Choose ---------------- */
const WHY = [
  {
    title: "Easy to Use",
    desc: "Simple interface, one can create in minutes.",
    icon: ImageIcon,
    tint: "from-purple-100 to-purple-50",
    ic: "text-[#6d4aff]",
    bg: "bg-purple-100",
  },
  {
    title: "Mobile Friendly",
    desc: "Perfect experience on all devices.",
    icon: Smartphone,
    tint: "from-pink-100 to-rose-50",
    ic: "text-[#ff5fa2]",
    bg: "bg-pink-100",
  },
  {
    title: "Instant Sharing",
    desc: "Share via WhatsApp, Facebook & more.",
    icon: Share2,
    tint: "from-sky-100 to-cyan-50",
    ic: "text-sky-500",
    bg: "bg-sky-100",
  },
  {
    title: "Secure & Private",
    desc: "Your data is safe and secure with us.",
    icon: Shield,
    tint: "from-emerald-100 to-teall-50",
    ic: "text-emerald-500",
    bg: "bg-emerald-100",
  },
  {
    title: "Premium Templates",
    desc: "Beautiful & professional designs for every occasion.",
    icon: Crown,
    tint: "from-amber-100 to-orange-50",
    ic: "text-amber-500",
    bg: "bg-amber-100",
  },
];
const WhyChoose = () => {
  const { site } = usePublicSettings();
  return (
    <section
      data-testid="home-benefits"
      className="relative bg-white py-12 dark:bg-slate-950 sm:py-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          eyebrow="Why we're loved"
          eyebrowIcon={Crown}
          eyebrowColor="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
          title={`Why Choose ${site.siteName}?`}
          titleAccent={`${site.siteName}?`}
        />
        <div className="mt-8 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:mt-12 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="relative rounded-2xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-soft hover:shadow-premium transition"
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${w.bg} grid place-items-center ${w.ic}`}
              >
                <w.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="mt-3 sm:mt-4 font-display font-bold text-[14px] sm:text-[16px] text-slate-900 dark:text-slate-100">
                {w.title}
              </h3>
              <p className="mt-1 text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-400 leading-relaxed">
                {w.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- Stats Counter ---------------- */
const Counter = ({ to, suffix = "" }) => {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = Date.now();
        const dur = 1500;
        const tick = () => {
          const p = Math.min(1, (Date.now() - start) / dur);
          setV(Math.floor(p * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
};
const Stats = () => (
  <section data-testid="home-stats" className="relative bg-white py-8 dark:bg-slate-950 sm:py-10">
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-[#6d4aff] via-[#7c3aed] to-[#8b5cf6] shadow-premium">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-11 h-11 rounded-full bg-white/60"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              opacity: (i % 3) * 0.3 + 0.3,
            }}
          />
        ))}
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#ff5fa2]/20 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-5 text-white sm:gap-6 md:grid-cols-4">
          {[
            { icon: Users, value: 10000, suffix: "+", label: "Happy Users" },
            { icon: Send, value: 10000, suffix: "+", label: "Wishes Created" },
            { icon: FileText, value: 100, suffix: "+", label: "Beautiful Templates" },
            { icon: Star, value: 4.9, suffix: "/5", label: "User Rating", float: true },
          ].map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur border border-white/20 grid place-items-center shrink-0">
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-[20px] sm:text-[28px] leading-none">
                  {s.float ? "4.9/5" : <Counter to={s.value} suffix={s.suffix} />}
                </div>
                <div className="text-[11px] sm:text-sm opacity-90 mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---------------- Testimonials ---------------- */
const TESTIMONIALS = [
  {
    name: "Neha Sharma",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces",
    text: "WishFly made it so easy to create a beautiful birthday wish for my sister. She absolutely loved it! ❤️",
  },
  {
    name: "Rahul Verma",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
    text: "The templates are amazing and so easy to customize. Highly recommended!",
  },
  {
    name: "Pooja & Amit",
    img: "https://images.pexels.com/photos/6311668/pexels-photo-6311668.jpeg?w=160&h=160&fit=crop",
    text: "Perfect for our anniversary! The experience was just fantastic.",
  },
];
const Testimonials = () => {
  const { site } = usePublicSettings();
  return (
    <section
      data-testid="home-testimonials"
      className="bg-gradient-to-b from-white to-purple-50/40 py-12 dark:from-slate-950 dark:to-slate-900 sm:py-20"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <SectionHeader
          eyebrow="Loved by users"
          eyebrowIcon={Heart}
          eyebrowColor="bg-rose-100 dark:bg-rose-900/40 text-[#ff5fa2]"
          title="What Our Users Say"
          titleEmoji="❤️"
        />
        <div className="mt-8 sm:mt-10 grid md:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative glass rounded-2xl p-5 sm:p-6 shadow-soft border border-white dark:border-slate-800"
            >
              <div className="absolute top-4 right-5 text-4xl leading-none text-purple-200 dark:text-purple-800 font-serif">
                ”
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white shadow"
                />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base inline-flex items-center gap-1">
                    {t.name} <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.text.replaceAll("WishFly", site.siteName)}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          <span className="w-6 h-1.5 rounded-full bg-[#5a39e6] dark:bg-[#a58dff]" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
      </div>
    </section>
  );
};

/* ---------------- CTA + Newsletter ---------------- */
const CTA = () => {
  const { site } = usePublicSettings();
  return (
    <section data-testid="home-cta" className="py-8 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-12 bg-gradient-to-r from-[#ff5fa2] via-[#c93aff] to-[#6d4aff] shadow-premium">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-11 h-11 rounded-full bg-white/60"
              style={{ left: `${(i * 29) % 100}%`, top: `${(i * 47) % 100}%` }}
            />
          ))}
          <div className="absolute left-8 bottom-6 text-5xl sm:text-6xl animate-floaty hidden md:block">
            ✉️
          </div>
          <div className="relative grid md:grid-cols-2 gap-6 sm:gap-8 items-center pl-0 md:pl-32 text-white">
            <div className="text-center md:text-left">
              <h3 className="font-display font-bold text-[22px] sm:text-[28px] lg:text-[32px] leading-tight">
                Ready to Create Your Wish?
              </h3>
              <p className="mt-2 text-white/90 text-[13px] sm:text-[14px]">
                Join thousands of people who are making their moments special with {site.siteName}.
              </p>
              <button className="mt-4 sm:mt-5 h-11 px-6 rounded-full bg-white text-[#5a39e6] font-semibold text-sm inline-flex items-center gap-2 shadow-lg hover:scale-105 transition">
                Get Started Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-display font-bold text-[18px] sm:text-[22px] text-center md:text-left">
                Don't Miss Updates!
              </h4>
              <p className="mt-1 text-white/90 text-[12px] sm:text-[13px] text-center md:text-left">
                Subscribe to get new templates and exclusive offers.
              </p>
              <form className="mt-3 flex flex-col gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lg min-[380px]:flex-row min-[380px]:rounded-full sm:mt-4">
                <input
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-transparent outline-none px-3 sm:px-4 text-sm text-slate-800 placeholder:text-slate-400"
                />
                <button className="h-10 shrink-0 rounded-full bg-gradient-to-r from-[#ff5fa2] to-[#c93aff] px-4 text-sm font-bold text-white sm:px-5">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- Footer ---------------- */
const Footer = () => {
  const { site } = usePublicSettings();
  return (
    <footer className="pt-12 sm:pt-14 pb-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ff5fa2] grid place-items-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 dark:text-slate-100">
                  {site.siteName}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">{site.tagline}</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-700 dark:text-slate-400 leading-relaxed max-w-md">
              Create beautiful digital wishes websites for occasion in minutes. Celebrate moments,
              share happiness.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[
                { i: Facebook, c: "bg-blue-500" },
                { i: Instagram, c: "bg-gradient-to-tr from-fuchsia-500 via-red-500 to-yellow-500" },
                { i: MessageCircle, c: "bg-emerald-500" },
                { i: Twitter, c: "bg-sky-500" },
                { i: Youtube, c: "bg-red-500" },
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-8 h-8 rounded-lg text-white grid place-items-center ${s.c} hover:scale-110 transition`}
                >
                  <s.i className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            {
              title: "Quick Links",
              items: ["Home", "Templates", "Categories", "How It Works", "Pricing"],
            },
            {
              title: "Support",
              items: ["Help Center", "FAQ", "Contact Us", "Privacy Policy", "Terms of Service"],
            },
            { title: "Comp", items: ["About Us", "Blog", "Careers", "Affiliate Program"] },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {col.title}
              </h5>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                {col.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#"
                      className="text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-400 hover:text-[#5a39e6] transition"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 lg:col-span-1">
            <h5 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Stay Connected
            </h5>
            <p className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-400">
              Get the latest updates and offers straight into your inbox.
            </p>
            <a
              href={`mailto:${site.supportEmail}`}
              className="mt-2 block text-[12px] font-semibold text-[#5a39e6] hover:underline"
            >
              {site.supportEmail}
            </a>
            <form className="mt-3 sm:mt-4 flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm">
              <input
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-transparent outline-none px-3 text-[13px] dark:text-slate-200"
              />
              <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5a39e6] to-[#8b5cf6] text-white grid place-items-center shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} {site.siteName}. All rights reserved.
          </div>
          <div className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 inline-flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-[#ff5fa2] text-[#ff5fa2]" /> in India
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ---------------- FAQ (bonus) ---------------- */
const FAQS = [
  {
    q: "What is WishFly?",
    a: "WishFly is a premium digital wishes platform. Choose a template, personalize it and share a unique link on WhatsApp, Instagram or where.",
  },
  {
    q: "Are the wishes free to create?",
    a: "Yes! You can create beautiful wishes for free. Premium features unlock more templates, music, video and password protection.",
  },
  {
    q: "Can I share on WhatsApp and Instagram?",
    a: "Absolutely. Every wish generates a unique link and QR code you can share on  social platform.",
  },
  {
    q: "Do you offer generated messages?",
    a: "Yes. Our message helper drafts a heartfelt starting point tuned to the occasion, which you can edit before publishing.",
  },
];
const FAQ = () => {
  const { site } = usePublicSettings();
  const faqs = FAQS.map((item) => ({
    q: item.q.replaceAll("WishFly", site.siteName),
    a: item.a.replaceAll("WishFly", site.siteName),
  }));
  return (
    <section data-testid="home-faq" className="bg-white py-12 dark:bg-slate-950 sm:py-16">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="FAQ"
          eyebrowIcon={MessageCircle}
          eyebrowColor="bg-sky-100 dark:bg-sky-900/40 text-sky-600"
          title="Frequently Asked Questions"
          description={`Everything you need to know about ${site.siteName}.`}
        />
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`i-${i}`}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-5 shadow-soft"
            >
              <AccordionTrigger className="font-display font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-sm sm:text-base text-left">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 text-[13px] sm:text-[14px] leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

/* ---------------- Wish Builder Dialog ---------------- */
const THEME_MAP = {
  "Birthday Celebration": "birthday",
  "Anniversary Wishes": "anniversary",
  "Independence Day": "festivall",
  "Wedding Invitation": "wedding",
  "Christmas Wishes": "christmas",
  "Baby Shower": "baby",
  "New Year 2025": "newyear",
  "Grand Opening": "invitation",
};

const MUSIC_TRACKS = [
  { id: "none", label: "No music", url: "" },
  {
    id: "celebration",
    label: "🎉 Celebration",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    id: "romantic",
    label: "💗 Romantic",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "peacefull",
    label: "🌸 Peacefull",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "festive",
    label: "✨ Festive",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "dreamy",
    label: "🌙 Dreamy",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  },
];

// Client-side image resize -> base64 JPEG (max 800px, quality 0.75)
const fileToResizedDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        let { width, height } = img;
        if (width > height && width > max) {
          height = height * (max / width);
          width = max;
        } else if (height > max) {
          width = width * (max / height);
          height = max;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const WishBuilder = ({ open, onClose, template }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    recipient: "",
    from: "",
    title: "",
    message: "",
    tone: "warm and heartfelt",
    details: "",
    photos: [],
    music: "",
    password: "",
    cover: "",
    eventDate: "",
    video: "",
    slug: "",
    narration: "",
    voice: "nova",
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [narrLoading, setNarrLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [publishError, setPublishError] = useState("");
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setResult(null);
      setPublishError("");
      setForm({
        recipient: "",
        from: "",
        title: template?.label || "",
        message: "",
        tone: "warm and heartfelt",
        details: "",
        photos: [],
        music: "",
        password: "",
        cover: "",
        eventDate: "",
        video: "",
        slug: "",
        narration: "",
        voice: "nova",
      });
    }
  }, [open, template]);

  const upd = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const theme = THEME_MAP[template?.title] || "birthday";
  const occasion = template?.title || "Birthday";

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - form.photos.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map((f) => fileToResizedDataURL(f)));
      upd("photos", [...form.photos, ...results].slice(0, 6));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const removePhoto = (i) =>
    upd(
      "photos",
      form.photos.filter((_, idx) => idx !== i),
    );

  const generateCover = async () => {
    setCoverLoading(true);
    try {
      const r = await fetch("/api/wishes/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, recipient: form.recipient, theme }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Cover generation failed");
      if (d.image) upd("cover", d.image);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cover generation failed");
    } finally {
      setCoverLoading(false);
    }
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const r = await fetch("/api/wishes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.recipient,
          occasion,
          tone: form.tone,
          from: form.from,
          details: form.details,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Message generation failed");
      if (d.message) upd("message", d.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const generateNarration = async () => {
    if (!form.message?.trim()) return;
    setNarrLoading(true);
    try {
      if (!("speechSynthesis" in window))
        throw new Error("Voice preview is not supported by this browser");
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(form.message);
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find((voice) => voice.lang.startsWith("en")) || null;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Voice preview failed");
    } finally {
      setNarrLoading(false);
    }
  };

  const onPickVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Video is too large. Please upload a file under 5MB.");
      return;
    }
    setVideoLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        upd("video", ev.target.result);
        setVideoLoading(false);
      };
      reader.onerror = () => setVideoLoading(false);
      reader.readAsDataURL(file);
    } catch {
      setVideoLoading(false);
    }
  };

  const createWishFn = useServerFn(createWish);

  const publish = async () => {
    setLoading(true);
    setPublishError("");
    try {
      const musicUrl = MUSIC_TRACKS.find((t) => t.id === form.music)?.url || "";
      const d = await createWishFn({
        data: { ...form, music: musicUrl, theme, templateId: template?.id || null },
        headers: await getAuthHeaders(),
      });

      if (d.error) {
        setPublishError(d.error || "Unable to publish. Try again.");
        return;
      }

      if (d.url) {
        const record = {
          id: d.id,
          url: d.url,
          fullUrl: `${window.location.origin}${d.url}`,
          title: form.title || template?.label || "A Wish",
          theme,
          recipient: form.recipient,
          hasPassword: !!form.password,
          createdAt: new Date().toISOString(),
        };
        try {
          const existing = JSON.parse(localStorage.getItem("wc-my-wishes") || "[]");
          localStorage.setItem("wc-my-wishes", JSON.stringify([record, ...existing].slice(0, 30)));
          window.dispatchEvent(new Event("wc-wishes-updated"));
        } catch {}
        setResult(record);
        setStep(4);
      }
    } catch (err) {
      setPublishError(err.message || "Unable to publish. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const shareWA = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`I made a special wish for you! ${result.fullUrl}${form.password ? ` (password: ${form.password})` : ""}`)}`,
      "_blank",
    );

  const previewMusic = (trackId) => {
    upd("music", trackId);
    const url = MUSIC_TRACKS.find((t) => t.id === trackId)?.url;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.volume = 0.4;
    audioRef.current.play().catch(() => {});
  };
  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    },
    [],
  );
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white shadow-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                Create Your Wish
              </DialogTitle>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {occasion} · 3 quick steps
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${step >= n ? "bg-gradient-to-br from-[#6d4aff] to-[#8b5cf6] text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
                >
                  {step > n || step === 4 ? <Check className="w-4 h-4" /> : n}
                </div>
                {n < 3 && (
                  <div
                    className={`h-0.5 flex-1 ${step > n || step === 4 ? "bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6]" : "bg-slate-200 dark:bg-slate-700"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Step 1 · Personalize
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Recipient name</Label>
                  <Input
                    data-testid="builder-recipient"
                    value={form.recipient}
                    onChange={(e) => upd("recipient", e.target.value)}
                    placeholder="e.g. Riya"
                  />
                </div>
                <div>
                  <Label className="text-xs">From (your name)</Label>
                  <Input
                    data-testid="builder-from"
                    value={form.from}
                    onChange={(e) => upd("from", e.target.value)}
                    placeholder="e.g. Amit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Wish title</Label>
                  <Input
                    data-testid="builder-title"
                    value={form.title}
                    onChange={(e) => upd("title", e.target.value)}
                    placeholder={template?.label || "Happy Birthday!"}
                  />
                </div>
                <div>
                  <Label className="text-xs">Event date (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => upd("eventDate", e.target.value)}
                    className="pr-2"
                  />
                </div>
              </div>

              {/* AI Cover Image */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Generated Cover Artwork (optional)</Label>
                  <div className="flex items-center gap-2">
                    <MediaPicker
                      value={form.cover}
                      onSelect={(url) => upd("cover", url)}
                      buttonLabel="Library"
                    />
                    <button
                      type="button"
                      onClick={generateCover}
                      disabled={coverLoading}
                      className="h-8 px-3 rounded-full bg-gradient-to-r from-[#ff5fa2] to-[#ff9f43] text-white font-semibold text-[11px] inline-flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {coverLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}{" "}
                      {form.cover ? "Regenerate" : "Generate"}
                    </button>
                  </div>
                </div>
                <div className="mt-2 aspect-[16/7] rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-slate-800 dark:to-slate-800 relative grid place-items-center">
                  {form.cover ? (
                    <img src={form.cover} alt="cover" className="w-full h-full object-cover" />
                  ) : coverLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-500" />
                      <div className="text-[11px] text-slate-500 mt-1">Painting your cover…</div>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-slate-400 px-4">
                      Click "Generate" to create a unique cover artwork for this wish.
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Photos (up to 6, optional)</Label>
                  <div className="flex items-center gap-2">
                    {form.photos.length < 6 && (
                      <MediaPicker
                        onSelect={(url) =>
                          upd("photos", [...new Set([...form.photos, url])].slice(0, 6))
                        }
                        buttonLabel="Add from Library"
                      />
                    )}
                    <span className="text-[11px] text-slate-400">{form.photos.length}/6</span>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {form.photos.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 group"
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {form.photos.length < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 grid place-items-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onPickFiles}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Video Message */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Video message (optional, up to 5MB)</Label>
                  {form.video && (
                    <button
                      onClick={() => upd("video", "")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  {form.video ? (
                    <video
                      src={form.video}
                      controls
                      className="w-full max-h-48 rounded-xl bg-black"
                    />
                  ) : (
                    <label className="flex items-center justify-center gap-2 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 transition text-xs text-slate-500">
                      {videoLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {videoLoading ? "Uploading video…" : "Upload a short video message"}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={onPickVideo}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  data-testid="builder-step-1-next"
                  onClick={() => setStep(2)}
                  className="h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Step 2 · Craft your message
                </div>
                <button
                  onClick={generateAI}
                  disabled={aiLoading}
                  className="h-9 px-4 rounded-full bg-gradient-to-r from-[#ff5fa2] to-[#ff9f43] text-white font-semibold text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}{" "}
                  Generate Message
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tone</Label>
                  <select
                    value={form.tone}
                    onChange={(e) => upd("tone", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option>warm and heartfelt</option>
                    <option>funny and playful</option>
                    <option>formal and respectful</option>
                    <option>romantic</option>
                    <option>poetic</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Personal details (optional)</Label>
                  <Input
                    value={form.details}
                    onChange={(e) => upd("details", e.target.value)}
                    placeholder="hobbies, memories, inside jokes..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Your message</Label>
                <Textarea
                  data-testid="builder-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => upd("message", e.target.value)}
                  placeholder="Write your wish, or click Generate Message above ✨"
                  className="bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="h-10 px-4 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  data-testid="builder-step-2-next"
                  onClick={() => setStep(3)}
                  disabled={!form.message}
                  className="h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Step 3 · Extras & Publish
              </div>

              {/* Music */}
              <div>
                <Label className="text-xs">Background music</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {MUSIC_TRACKS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => previewMusic(t.id)}
                      className={`h-10 rounded-lg text-xs font-semibold border transition ${form.music === t.id ? "bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white border-transparent shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-purple-300"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Tap to preview · Plays softly on the recipient's page.
                </div>
              </div>

              {/* Browser voice preview */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Voice Preview (optional)</Label>
                  <button
                    type="button"
                    onClick={generateNarration}
                    disabled={narrLoading || !form.message}
                    className="h-8 px-3 rounded-full bg-gradient-to-r from-[#ff5fa2] to-[#ff9f43] text-white font-semibold text-[11px] inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {narrLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}{" "}
                    Preview Voice
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select
                    value={form.voice}
                    onChange={(e) => upd("voice", e.target.value)}
                    className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="nova">Nova (warm female)</option>
                    <option value="shimmer">Shimmer (bright female)</option>
                    <option value="alloy">Alloy (neutral)</option>
                    <option value="echo">Echo (male)</option>
                    <option value="fable">Fable (British male)</option>
                    <option value="onyx">Onyx (deep male)</option>
                  </select>
                  {form.narration && (
                    <audio src={form.narration} controls className="h-10 w-full" />
                  )}
                </div>
              </div>

              {/* Custom Vanity Slug */}
              <div>
                <Label className="text-xs">Custom link name (optional)</Label>
                <div className="mt-1 flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                  <span className="pl-3 pr-1 text-[13px] text-slate-400 whitespace-nowrap">
                    /wish/
                  </span>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      upd("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    maxLength={40}
                    placeholder="riya-birthday"
                    className="flex-1 h-10 bg-transparent outline-none text-sm"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Get a friendly URL like{" "}
                  <b>
                    {typeof window !== "undefined" ? window.location.host : "wishfly"}/wish/
                    {form.slug || "riya-birthday"}
                  </b>
                  . Lowercase, numbers, hyphens.
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="text-xs">Password protect (optional)</Label>
                <div className="mt-1 relative">
                  <Input
                    data-testid="builder-password"
                    value={form.password}
                    onChange={(e) => upd("password", e.target.value)}
                    placeholder="Leave empty for public wish"
                  />
                  <Shield className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5">
                  Only people with this password can open your wish.
                </div>
              </div>

              {publishError && (
                <div className="p-2 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800/50">
                  {publishError}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="h-10 px-4 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  data-testid="builder-publish"
                  onClick={publish}
                  disabled={loading}
                  className="h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}{" "}
                  Publish Wish
                </button>
              </div>
            </div>
          )}

          {step === 4 && result && (
            <div className="text-center py-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="mt-4 font-display font-bold text-2xl text-slate-900 dark:text-slate-100">
                Your wish is live! 🎉
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Share this unique link where
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-center gap-4 justify-center">
                <img
                  alt="QR"
                  className="w-36 h-36 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white p-1.5"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(result.fullUrl)}`}
                />
                <div className="text-left max-w-xs">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Scan or share the link
                  </div>
                  <div className="mt-2 flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300 pl-2">
                      {result.fullUrl}
                    </div>
                    <button
                      onClick={copyLink}
                      className="h-7 px-3 rounded-full bg-white dark:bg-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 inline-flex items-start gap-1.5">
                      <Shield className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>
                        Password: <b>{form.password}</b> — share separately with the recipient.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-4 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Wish
                </a>
                <button
                  onClick={shareWA}
                  className="h-10 px-4 rounded-full bg-emerald-500 text-white font-semibold text-sm inline-flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={onClose}
                  className="h-10 px-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- My Wishes Dashboard ---------------- */
const MyWishesDialog = ({ open, onClose, onCreateNew }) => {
  const [wishes, setWishes] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const load = () => {
    try {
      setWishes(JSON.parse(localStorage.getItem("wc-my-wishes") || "[]"));
    } catch {
      setWishes([]);
    }
  };
  useEffect(() => {
    if (open) load();
    const h = () => load();
    window.addEventListener("wc-wishes-updated", h);
    return () => window.removeEventListener("wc-wishes-updated", h);
  }, [open]);

  const remove = (id) => {
    const next = wishes.filter((w) => w.id !== id);
    setWishes(next);
    localStorage.setItem("wc-my-wishes", JSON.stringify(next));
  };
  const copy = (u, id) => {
    navigator.clipboard.writeText(u);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const themeColor = {
    birthday: "from-fuchsia-400 to-pink-500",
    anniversary: "from-rose-400 to-red-500",
    wedding: "from-amber-300 to-rose-400",
    love: "from-pink-500 to-red-500",
    baby: "from-sky-300 to-pink-300",
    christmas: "from-emerald-600 to-emerald-800",
    diwalli: "from-amber-400 to-orange-600",
    newyear: "from-yellow-500 to-red-600",
    festivall: "from-fuchsia-500 to-indigo-600",
    invitation: "from-indigo-400 to-purple-600",
  };
  const themeEmoji = {
    birthday: "🎂",
    anniversary: "💐",
    wedding: "💒",
    love: "💗",
    baby: "👶",
    christmas: "🎄",
    diwalli: "🪔",
    newyear: "🎆",
    festivall: "🎉",
    invitation: "💌",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white shadow-lg">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-xl text-slate-900 dark:text-slate-100">
                My Wishes
              </DialogTitle>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {wishes.length} saved on this device
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onCreateNew();
            }}
            className="h-9 px-4 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> New Wish
          </button>
        </div>
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {wishes.length === 0 ? (
            <div className="text-center py-14">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center">
                <Heart className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="mt-4 font-display font-bold text-slate-900 dark:text-slate-100">
                No wishes yet
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Create your first wish and it will appear here for quick access from browser
                session.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onCreateNew();
                }}
                className="mt-5 h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> Create Your First Wish
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {wishes.map((w) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-premium transition"
                >
                  <div
                    className={`relative h-24 bg-gradient-to-br ${themeColor[w.theme] || themeColor.birthday} text-white flex items-center gap-3 px-4`}
                  >
                    <div className="text-3xl drop-shadow">{themeEmoji[w.theme] || "🎉"}</div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold truncate"
                        style={{ fontFamily: "Georgia,serif", fontStyle: "italic" }}
                      >
                        {w.title}
                      </div>
                      <div className="text-[11px] opacity-90 truncate">
                        {w.recipient ? `For ${w.recipient}` : "For someone special"} ·{" "}
                        {new Date(w.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {w.hasPassword && (
                      <div
                        className="w-7 h-7 rounded-full bg-white/25 backdrop-blur grid place-items-center border border-white/30"
                        title="Password protected"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex items-center gap-2">
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-semibold text-xs inline-flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>
                    <button
                      onClick={() => copy(w.fullUrl, w.id)}
                      className="h-9 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 font-semibold text-xs inline-flex items-center gap-1.5"
                    >
                      {copiedId === w.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => remove(w.id)}
                      className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 grid place-items-center"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Template Preview Dialog ---------------- */
const TemplatePreview = ({ open, onClose, template, onUse }) => {
  if (!template) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${template.color}`} />
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-11 h-11 rounded-full bg-white/70 animate-pullse"
              style={{ left: `${(i * 29) % 95}%`, top: `${(i * 41) % 90}%` }}
            />
          ))}
          <div className="absolute top-6 left-6 text-4xl">🎈</div>
          <div className="absolute top-8 right-8 text-4xl">🎈</div>
          <div className="absolute inset-0 flex flex-col items-center text-center text-white p-8 pt-16">
            <div
              className="font-bold text-[42px] leading-tight"
              style={{
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              {template.label}
            </div>
            {template.sub && <div className="mt-2 text-lg opacity-95">{template.sub}</div>}
            <div className="mt-auto text-[120px] leading-none drop-shadow-2xl">
              {template.emoji}
            </div>
            <div className="text-sm opacity-90 mt-2">
              {template.pages} beautiful pages · Free & Premium
            </div>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                {template.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Preview · Personalize your version in seconds
              </div>
            </div>
            <button
              onClick={onUse}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-sm inline-flex items-center gap-1.5"
            >
              Use Template <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Temp Admin Access Button (remove after handoff) ---------------- */
const AdminAccessButton = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const copy = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };
  return (
    <>
      <motion.button
        data-testid="admin-access-fab"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[70] h-12 pl-3 pr-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-[12.5px] shadow-2xl inline-flex items-center gap-2 border border-white/20"
        style={{ boxShadow: "0 20px 50px -10px rgba(109,74,255,0.45)" }}
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-[11px] font-bold">
          A
        </span>
        Admin Access
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[420px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header banner */}
              <div className="relative bg-gradient-to-br from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] p-6 text-white">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/15 blur-2xl" />
                <button
                  onClick={() => setOpen(false)}
                  data-testid="admin-modall-close"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur grid place-items-center hover:bg-white/30 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur grid place-items-center">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <div className="mt-3 font-display font-bold text-[20px] leading-tight">
                    Admin Panel Access
                  </div>
                  <div className="text-[12px] opacity-90 mt-1">
                    Sign in admin to manage everything.
                  </div>
                </div>
              </div>

              {/* Credentialls */}
              <div className="p-6 space-y-3">
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
                  Credentialls
                </div>

                {[
                  { label: "Email", value: "Use your authorized admin email" },
                  { label: "Password", value: "Use your private admin password" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                        {row.label}
                      </div>
                      <div className="font-mono text-[13.5px] text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                        {row.value}
                      </div>
                    </div>
                    <button
                      data-testid={`copy-${row.label.toLowerCase()}`}
                      onClick={() => copy(row.label, row.value)}
                      className="h-9 px-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 inline-flex items-center gap-1.5 shrink-0"
                    >
                      {copied === row.label ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const App = () => {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [myOpen, setMyOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (p.get("create") === "1") {
      setSelectedTemplate(null);
      setBuilderOpen(true);
    }
  }, []);
  const ctx = {
    openBuilder: (t) => {
      setSelectedTemplate(t || null);
      setBuilderOpen(true);
    },
    openPreview: (t) => {
      setSelectedTemplate(t);
      setPreviewOpen(true);
    },
    openMyWishes: async () => {
      try {
        const { data } = await supabase.auth.getSession();
        window.location.href = data.session ? "/account" : "/account/login";
      } catch {
        window.location.href = "/account/login";
      }
    },
  };
  return (
    <WishCtx.Provider value={ctx}>
      <main className="relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <SiteHeader active="/" />
        <Hero />
        <Categories />
        <Trending />
        <HowItWorks />
        <WhyChoose />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTA />
        <SiteFooter />
      </main>
      <WishBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        template={selectedTemplate}
      />
      <TemplatePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        template={selectedTemplate}
        onUse={() => {
          setPreviewOpen(false);
          setBuilderOpen(true);
        }}
      />
      <MyWishesDialog
        open={myOpen}
        onClose={() => setMyOpen(false)}
        onCreateNew={() => {
          setSelectedTemplate(null);
          setBuilderOpen(true);
        }}
      />
    </WishCtx.Provider>
  );
};

export const Route = createFileRoute("/")({
  component: App,
});
