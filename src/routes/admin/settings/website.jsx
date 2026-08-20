import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Globe, Save, Loader2 } from "lucide-react";
import { getAdminSettings, postAdminSettings } from "@/lib/admin-features.functions";
import { toast } from "sonner";

function WebsiteSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAdminSettings({ data: { type: "website" } });
      setSettings(data.general || {});
    } catch (e) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await postAdminSettings({ data: { type: "website", key: "general", value: settings } });
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Website Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure your site identity and global metadata.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-4">General Info</h2>
          <div>
            <label className={labelClass}>Site Name</label>
            <input
              type="text"
              value={settings.site_name || ""}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className={inputClass}
              placeholder="WishFly"
            />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className={inputClass}
              placeholder="Personalized Greeting Experiences"
            />
          </div>
          <div>
            <label className={labelClass}>Support Email</label>
            <input
              type="email"
              value={settings.support_email || ""}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className={inputClass}
              placeholder="hello@wishfly.app"
            />
          </div>
        </div>

        <div className="space-y-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-4">SEO Defaults</h2>
          <div>
            <label className={labelClass}>Meta Title</label>
            <input
              type="text"
              value={settings.default_meta_title || ""}
              onChange={(e) => setSettings({ ...settings, default_meta_title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea
              value={settings.default_meta_description || ""}
              onChange={(e) =>
                setSettings({ ...settings, default_meta_description: e.target.value })
              }
              className={`${inputClass} h-32 resize-none`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/settings/website")({
  component: WebsiteSettingsPage,
});
