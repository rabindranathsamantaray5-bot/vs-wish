"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Mail, Phone, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
import { SITE } from "@/lib/site-config";

export function PublicPage({
  active = "",
  eyebrow,
  icon: Icon = Sparkles,
  title,
  accent,
  description,
  children,
  ctaTitle = "Ready to make a moment unforgettable?",
  ctaText = "Choose a design, add your story and share something that feels genuinely personal.",
  ctaHref = "/templates",
  ctaLabel = "Explore templates",
  testId = "public-page",
}) {
  const { site } = usePublicSettings();
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white"
      data-testid={testId}
    >
      <SiteHeader active={active} />
      <main>
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,95,162,.22),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(109,74,255,.22),transparent_30%),linear-gradient(180deg,#fff_0%,#faf7ff_65%,#fff_100%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(255,95,162,.14),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(109,74,255,.22),transparent_30%),linear-gradient(180deg,#020617_0%,#100828_65%,#020617_100%)]" />
          <div className="absolute left-[7%] top-28 -z-10 h-24 w-24 rounded-full border border-pink-300/50 bg-pink-200/25 blur-[1px]" />
          <div className="absolute right-[8%] top-36 -z-10 h-36 w-36 rounded-[42px] border border-purple-300/40 bg-purple-300/15 rotate-12" />
          <div className="absolute left-1/2 top-20 -z-10 h-px w-[78%] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-300/70 to-transparent" />

          <div className="mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6d4aff] shadow-lg shadow-purple-500/10 backdrop-blur dark:border-purple-800/60 dark:bg-slate-900/70 dark:text-purple-300"
            >
              <Icon className="h-4 w-4" /> {eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-6 max-w-5xl font-display text-[clamp(2.8rem,7vw,6.4rem)] font-bold leading-[0.92] tracking-[-0.055em]"
            >
              {title}{" "}
              {accent && (
                <span className="bg-gradient-to-r from-[#6d4aff] via-[#b33cff] to-[#ff5fa2] bg-clip-text text-transparent">
                  {accent}
                </span>
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300"
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-3 rounded-full border border-white/80 bg-white/75 p-2 shadow-2xl shadow-purple-500/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70"
            >
              <a
                href={`mailto:${site.supportEmail}`}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold text-slate-700 hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Mail className="h-4 w-4 text-[#6d4aff]" /> {site.supportEmail}
              </a>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
              >
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">{children}</div>

        <section className="px-4 pb-10 sm:px-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-[#ff5fa2] via-[#c83cff] to-[#6d4aff] px-6 py-12 text-white shadow-[0_30px_90px_-30px_rgba(109,74,255,.75)] sm:px-12 sm:py-16">
            <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full border-[26px] border-white/10" />
            <div className="absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  <Heart className="h-4 w-4 fill-current" /> {site.siteName}
                </div>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {ctaTitle}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                  {ctaText}
                </p>
              </div>
              <a
                href={ctaHref}
                className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#6d4aff] shadow-xl transition hover:-translate-y-1"
              >
                {ctaLabel} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ContentSection({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`py-10 sm:py-14 ${className}`}>
      {(eyebrow || title || description) && (
        <div className="mb-8 max-w-3xl">
          {eyebrow && (
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6d4aff]">
              {eyebrow}
            </div>
          )}
          {title && <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
          {description && (
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function PremiumCard({ icon: Icon, title, children, href, label = "Learn more" }) {
  const content = (
    <div className="group h-full rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_55px_-30px_rgba(76,29,149,.45)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-[0_25px_70px_-28px_rgba(109,74,255,.5)] dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-purple-700">
      {Icon && (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-[#6d4aff] transition group-hover:scale-110 dark:from-purple-950 dark:to-pink-950 dark:text-purple-300">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
      {href && (
        <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#6d4aff]">
          {label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}

export function RichText({ children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 text-sm leading-8 text-slate-700 shadow-[0_20px_70px_-40px_rgba(76,29,149,.45)] sm:p-10 sm:text-base dark:border-slate-800 dark:bg-slate-900/85 dark:text-slate-300">
      {children}
    </div>
  );
}
