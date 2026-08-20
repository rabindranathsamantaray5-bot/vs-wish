import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { getAdminSettings, postAdminSettings } from "@/lib/admin-features.functions";
import { toast } from "sonner";

function SystemSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAdminSettings({ data: { type: "system" } });
      setSettings(data.features || {});
    } catch (e) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await postAdminSettings({ data: { type: "system", key: "features", value: settings } });
      toast.success("System settings updated");
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

  const toggleClass = (enabled) =>
    `flex items-center gap-2 h-11 px-4 rounded-xl border transition-all ${
      enabled
        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
        : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
    }`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-500" />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">Enable or disable core platform features.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update System
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">User Registration</h3>
            <p className="text-sm text-slate-500">Allow new users to sign up for accounts.</p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, registration_enabled: !settings.registration_enabled })
            }
            className={toggleClass(settings.registration_enabled)}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all ${settings.registration_enabled ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}
            />
            <span className="text-[13px] font-semibold">
              {settings.registration_enabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Public Comments</h3>
            <p className="text-sm text-slate-500">Allow guests to leave messages on wishes.</p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, comments_enabled: !settings.comments_enabled })
            }
            className={toggleClass(settings.comments_enabled)}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all ${settings.comments_enabled ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}
            />
            <span className="text-[13px] font-semibold">
              {settings.comments_enabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Maintenance Mode</h3>
            <p className="text-sm text-slate-500">Disable customer-facing features for updates.</p>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })
            }
            className={toggleClass(settings.maintenance_mode)}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all ${settings.maintenance_mode ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}
            />
            <span className="text-[13px] font-semibold">
              {settings.maintenance_mode ? "Active" : "Inactive"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/settings/system")({
  component: SystemSettingsPage,
});
