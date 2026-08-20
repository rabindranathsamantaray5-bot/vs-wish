"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Loader2, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const inp =
  "w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-400 dark:focus:border-purple-500 text-[14px] transition-all";

const Row = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default function ResourceManager({
  resource,
  title,
  subtitle,
  fields,
  columns,
  defaults = {},
  testIdPrefix,
  readOnly = false,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await import("@/integrations/supabase/client").then((m) => m.supabase.auth.getSession());
      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const r = await fetch(`/api/admin/${resource}`, {
        credentials: "include",
        headers,
      });
      const d = await r.json();
      setItems(d.items || []);
    } catch (e) {
      toast.error(`Failed to load ${resource}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [resource]);

  const openEdit = (item) => {
    setForm({ ...defaults, ...item });
    setEditing(item);
  };

  const openNew = () => {
    setForm(defaults);
    setEditing("new");
    setFile(null);
    setUploadProgress(0);
  };

  const close = () => {
    setEditing(null);
    setForm(defaults);
    setFile(null);
    setUploadProgress(0);
  };

  const save = async () => {
    setSaving(true);
    setUploadProgress(0);
    try {
      const isNew = editing === "new";
      const {
        data: { session },
      } = await import("@/integrations/supabase/client").then((m) => m.supabase.auth.getSession());
      const headers = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      let d;
      if (isNew && file) {
        // Handle file upload for media
        const formData = new FormData();
        formData.append("file", file);
        Object.keys(form).forEach((key) => {
          if (form[key] !== undefined && form[key] !== null) {
            formData.append(key, form[key]);
          }
        });

        const r = await fetch(`/api/admin/${resource}`, {
          method: "POST",
          credentials: "include",
          headers,
          body: formData,
        });
        d = await r.json();
        if (!r.ok) throw new Error(d.error || "Upload failed");
      } else {
        const url = isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${editing.id}`;
        const method = isNew ? "POST" : "PATCH";

        const r = await fetch(url, {
          method,
          credentials: "include",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        d = await r.json();
        if (!r.ok) throw new Error(d.error || "Save failed");
      }

      toast.success(isNew ? "Created successfully" : "Updated successfully");
      close();
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const {
        data: { session },
      } = await import("@/integrations/supabase/client").then((m) => m.supabase.auth.getSession());
      const headers = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      const r = await fetch(`/api/admin/${resource}/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });
      if (!r.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = q
    ? items.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div data-testid={`${testIdPrefix}-admin-page`}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-[20px] text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-10 w-[200px] sm:w-[240px] pl-9 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 border-none outline-none text-sm"
              data-testid={`${testIdPrefix}-search`}
            />
          </div>
          {!readOnly && (
            <button
              onClick={openNew}
              className="h-10 px-4 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No {resource} found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-[11.5px] uppercase tracking-wider whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                  {!readOnly && (
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400 text-[11.5px] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {c.render ? c.render(item) : item[c.key]}
                      </td>
                    ))}
                    {!readOnly && (
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-[12px] text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!readOnly && editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-6"
            onClick={close}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-[500px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <div className="font-display font-bold text-[16px] text-slate-900 dark:text-slate-100">
                    {editing === "new"
                      ? `Add New ${resource.slice(0, -1)}`
                      : `Edit ${resource.slice(0, -1)}`}
                  </div>
                  {editing !== "new" && (
                    <div className="text-[11.5px] text-slate-500 dark:text-slate-400">
                      ID: {editing.id}
                    </div>
                  )}
                </div>
                <button
                  onClick={close}
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {fields
                  .filter((f) => !f.createOnly || editing === "new")
                  .map((f) => (
                    <Row key={f.key} label={f.label}>
                      {f.type === "file" ? (
                        <div className="space-y-2">
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                            accept={f.accept}
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-purple-400 focus:outline-none"
                          >
                            <span className="flex items-center space-x-2">
                              <Plus className="w-6 h-6 text-slate-400" />
                              <span className="font-medium text-slate-600 dark:text-slate-400">
                                {file ? file.name : f.placeholder || "Drop file or click to upload"}
                              </span>
                            </span>
                          </label>
                          {saving && uploadProgress > 0 && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : f.type === "list" ? (
                        <textarea
                          value={Array.isArray(form[f.key]) ? form[f.key].join("\n") : ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [f.key]: e.target.value
                                .split(/\r?\n|,/)
                                .map((value) => value.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder={f.placeholder}
                          className={`${inp} min-h-28 py-3`}
                        />
                      ) : f.type === "select" ? (
                        <select
                          value={form[f.key] || ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className={inp}
                        >
                          {f.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "toggle" ? (
                        <button
                          onClick={() => setForm({ ...form, [f.key]: !form[f.key] })}
                          className={`flex items-center gap-2 h-11 px-4 rounded-xl border transition-all ${
                            form[f.key]
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                              : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all ${form[f.key] ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}
                          />
                          <span className="text-[13px] font-semibold">
                            {form[f.key] ? "Enabled" : "Disabled"}
                          </span>
                        </button>
                      ) : (
                        <input
                          type={f.type || "text"}
                          value={form[f.key] || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [f.key]:
                                f.type === "number" ? Number(e.target.value) : e.target.value,
                            })
                          }
                          placeholder={f.placeholder}
                          required={Boolean(f.required)}
                          minLength={f.minLength}
                          className={inp}
                        />
                      )}
                    </Row>
                  ))}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={close}
                    className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[14px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white font-bold text-[14px] shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : editing === "new" ? (
                      "Create"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
