"use client";
import { Heart, Send, Facebook, Instagram, MessageCircle, Twitter, Youtube } from "lucide-react";
import { SITE, FOOTER_NAV } from "@/lib/site-config";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

const SOCIALS = [
  { key: "facebook", i: Facebook, c: "bg-blue-500", label: "Facebook" },
  {
    key: "instagram",
    i: Instagram,
    c: "bg-gradient-to-tr from-fuchsia-500 via-red-500 to-yellow-500",
    label: "Instagram",
  },
  { key: "whatsapp", i: MessageCircle, c: "bg-emerald-500", label: "WhatsApp" },
  { key: "twitter", i: Twitter, c: "bg-sky-500", label: "X (Twitter)" },
  { key: "youtube", i: Youtube, c: "bg-red-500", label: "YouTube" },
];

export function SiteFooter() {
  const { site } = usePublicSettings();
  return (
    <footer data-testid="site-footer" className="pt-12 sm:pt-14 pb-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2.5" aria-label={`${site.siteName} home`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ff5fa2] grid place-items-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 dark:text-slate-100">
                  {site.siteName}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">{site.tagline}</div>
              </div>
            </a>
            <p className="mt-4 text-[13px] text-slate-700 dark:text-slate-400 leading-relaxed max-w-md">
              Create beautiful digital wish websites for any occasion in minutes. Celebrate moments,
              share happiness.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {SOCIALS.map((s) => {
                const url = SITE.social[s.key];
                const Icon = s.i;
                const cls = `w-8 h-8 rounded-lg text-white grid place-items-center ${s.c} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4aff]`;
                return url ? (
                  <a
                    key={s.key}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${site.siteName} on ${s.label}`}
                    className={`${cls} hover:scale-110`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    key={s.key}
                    aria-label={`${s.label} — coming soon`}
                    title={`${s.label} — coming soon`}
                    className={`${cls} opacity-60`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                );
              })}
            </div>
          </div>
          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h5 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {col.title}
              </h5>
              <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      className="text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-400 hover:text-[#5a39e6] dark:hover:text-[#b39bff] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6d4aff] rounded"
                    >
                      {it.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 lg:col-span-1">
            <h5 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Get in touch
            </h5>
            <p className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] text-slate-700 dark:text-slate-400">
              Questions, feedback or partnership ideas? We read every message.
            </p>
            <div className="mt-3 space-y-2">
              <a
                href={`mailto:${site.supportEmail}`}
                className="block text-[12px] sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 hover:text-[#5a39e6] dark:hover:text-[#b39bff] transition"
              >
                {site.supportEmail}
              </a>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="block text-[12px] sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 hover:text-[#5a39e6] dark:hover:text-[#b39bff] transition"
              >
                {SITE.phone}
              </a>
              <a
                href="/contact"
                className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-gradient-to-r from-[#5a39e6] to-[#8b5cf6] text-white text-[12px] font-semibold"
              >
                Contact Us <Send className="w-3.5 h-3.5" />
              </a>
            </div>
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
}

export default SiteFooter;
