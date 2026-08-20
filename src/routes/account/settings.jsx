import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, Lock, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { updateProfile } from "@/lib/auth-supabase.functions";
import { supabase } from "@/integrations/supabase/client";
import { getAuthHeaders } from "@/lib/auth-client";

function AccountSettings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", avatarUrl: "", phone: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const updateProfileFn = useServerFn(updateProfile);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const metadata = sessionUser.user_metadata || {};
        const customer = {
          ...sessionUser,
          name: metadata.full_name || sessionUser.email?.split("@")[0] || "User",
          avatarUrl: metadata.avatar_url || "",
          phone: metadata.phone || "",
        };
        setUser(customer);
        setForm({
          name: customer.name,
          avatarUrl: customer.avatarUrl,
          phone: customer.phone,
        });
      }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const d = await updateProfileFn({ data: form, headers: await getAuthHeaders() });
      toast.success("Profile updated");
      setUser(d.user);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  };

  const changePw = async () => {
    if (!pw.currentPassword) return toast.error("Current password is required");
    if (pw.newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    setPwSaving(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: pw.currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({
        password: pw.newPassword,
      });
      if (error) throw error;
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Password change failed");
    }
    setPwSaving(false);
  };

  if (!user)
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-5 h-5 animate-spin inline" />
      </div>
    );

  return (
    <div data-testid="account-settings" className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display font-bold text-[22px] text-slate-900 dark:text-slate-100">
          Profile Settings
        </h2>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
          Keep your profile up to date and manage your password.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-slate-400" />
          <div className="font-display font-bold text-[15px]">Personal Info</div>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6d4aff] to-[#ff5fa2] grid place-items-center text-white text-2xl font-display font-bold overflow-hidden">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (form.name || "U")[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500">Email (cannot be changed)</div>
            <div className="font-mono text-[13px] text-slate-800 dark:text-slate-200 truncate">
              {user.email}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Row label="Full name">
            <input
              data-testid="settings-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inp}
            />
          </Row>
          <Row label="Phone">
            <input
              data-testid="settings-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 …"
              className={inp}
            />
          </Row>
          <Row label="Avatar URL" full>
            <input
              data-testid="settings-avatar"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="https://…"
              className={inp}
            />
          </Row>
        </div>
        <button
          onClick={save}
          disabled={saving}
          data-testid="settings-save"
          className="mt-5 h-11 px-6 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-semibold text-[13.5px] shadow-lg shadow-purple-500/25 inline-flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{" "}
          Save Changes
        </button>
      </div>

      {/* Password */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-slate-400" />
          <div className="font-display font-bold text-[15px]">Change Password</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Row label="Current password">
            <input
              data-testid="settings-cur-pw"
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              className={inp}
            />
          </Row>
          <Row label="New password">
            <input
              data-testid="settings-new-pw"
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              placeholder="At least 6 characters"
              className={inp}
            />
          </Row>
        </div>
        <button
          onClick={changePw}
          disabled={pwSaving}
          data-testid="settings-pw-save"
          className="mt-5 h-11 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-[13.5px] inline-flex items-center gap-2 disabled:opacity-60"
        >
          {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}{" "}
          Update Password
        </button>
      </div>
    </div>
  );
}

const inp =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] focus:ring-2 focus:ring-purple-100 outline-none text-[14px]";

const Row = ({ label, children, full }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);

export const Route = createFileRoute("/account/settings")({
  component: AccountSettings,
});
