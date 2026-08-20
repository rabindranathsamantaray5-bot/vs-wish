import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const DEFAULT_PUBLIC_SETTINGS = {
  site: {
    siteName: "WishFly",
    tagline: "Make Every Moment Special",
    supportEmail: "rnscreation143@gmail.com",
    defaultMetaTitle: "WishFly | Premium Digital Wishes & Greetings",
    defaultMetaDescription:
      "Create breathtaking digital wishes with premium templates, custom messages and magical animations.",
  },
  features: {
    registrationEnabled: true,
    commentsEnabled: true,
    maintenanceMode: false,
  },
};

export async function getPublicSettings() {
  const [{ data: websiteRows, error: websiteError }, { data: systemRows, error: systemError }] =
    await Promise.all([
      supabaseAdmin.from("website_settings").select("key,value").eq("key", "general"),
      supabaseAdmin.from("system_settings").select("key,value").eq("key", "features"),
    ]);
  if (websiteError) throw websiteError;
  if (systemError) throw systemError;

  const website = (websiteRows?.[0]?.value || {}) as Record<string, unknown>;
  const system = (systemRows?.[0]?.value || {}) as Record<string, unknown>;

  return {
    site: {
      siteName: String(website["site_name"] || DEFAULT_PUBLIC_SETTINGS.site.siteName),
      tagline: String(website["tagline"] || DEFAULT_PUBLIC_SETTINGS.site.tagline),
      supportEmail: String(website["support_email"] || DEFAULT_PUBLIC_SETTINGS.site.supportEmail),
      defaultMetaTitle: String(
        website["default_meta_title"] ||
          `${String(website["site_name"] || DEFAULT_PUBLIC_SETTINGS.site.siteName)} | Premium Digital Wishes & Greetings`,
      ),
      defaultMetaDescription: String(
        website["default_meta_description"] || DEFAULT_PUBLIC_SETTINGS.site.defaultMetaDescription,
      ),
    },
    features: {
      registrationEnabled: system["registration_enabled"] !== false,
      commentsEnabled: system["comments_enabled"] !== false,
      maintenanceMode: system["maintenance_mode"] === true,
    },
  };
}
