"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Heart, Wrench } from "lucide-react";

const defaults = {
  site: {
    siteName: "WishFly",
    tagline: "Make Every Moment Special",
    supportEmail: "rnscreation143@gmail.com",
    defaultMetaTitle: "WishFly | Premium Digital Wishes & Greetings",
    defaultMetaDescription: "Create beautiful digital wishes for every special occasion.",
  },
  features: {
    registrationEnabled: true,
    commentsEnabled: true,
    maintenanceMode: false,
  },
  ready: false,
};

const PublicSettingsContext = createContext(defaults);

function setMeta(attribute, name, content) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function PublicSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    fetch("/api/public/settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Settings could not be loaded");
        setSettings({ ...data, ready: true });
        document.title = data.site.defaultMetaTitle;
        setMeta("name", "description", data.site.defaultMetaDescription);
        setMeta("name", "application-name", data.site.siteName);
        setMeta("property", "og:title", data.site.defaultMetaTitle);
        setMeta("property", "og:description", data.site.defaultMetaDescription);
        setMeta("name", "twitter:title", data.site.defaultMetaTitle);
        setMeta("name", "twitter:description", data.site.defaultMetaDescription);
      })
      .catch(() => setSettings((current) => ({ ...current, ready: true })));
  }, []);

  const path = typeof window === "undefined" ? "" : window.location.pathname;
  const isAdminOrApi = path.startsWith("/admin") || path.startsWith("/api");
  const maintenance = settings.ready && settings.features.maintenanceMode && !isAdminOrApi;

  return (
    <PublicSettingsContext.Provider value={settings}>
      {maintenance ? (
        <main
          className="grid min-h-screen place-items-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-5 text-center dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
          data-testid="maintenance-page"
        >
          <div className="max-w-lg rounded-3xl border border-white/80 bg-white/85 p-8 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg">
              <Wrench className="h-7 w-7" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold">We’ll be right back</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {settings.site.siteName} is temporarily under maintenance. We are improving your
              experience—please check again shortly.
            </p>
            <a
              href={`mailto:${settings.site.supportEmail}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              <Heart className="h-4 w-4" /> Contact support
            </a>
          </div>
        </main>
      ) : (
        children
      )}
    </PublicSettingsContext.Provider>
  );
}

export const usePublicSettings = () => useContext(PublicSettingsContext);
