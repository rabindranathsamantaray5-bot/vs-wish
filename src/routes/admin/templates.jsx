"use client";

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pencil, Loader2, Check, X, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/lib/auth-client";
import { MediaPicker } from "@/components/MediaPicker";

const BADGE_OPTIONS = ["", "Popular", "New", "Trending"];

const effectivePrice = (template) => {
  const basePrice = Math.max(0, Number(template.price) || 0);
  if (
    template.discountPrice === null ||
    template.discountPrice === undefined ||
    template.discountPrice === ""
  ) {
    return basePrice;
  }
  return Math.max(0, Number(template.discountPrice) || 0);
};

function TemplatesAdminPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const [templatesResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/templates", { credentials: "include", headers }),
        fetch("/api/admin/categories", { credentials: "include", headers }),
      ]);
      const [templatesData, categoriesData] = await Promise.all([
        templatesResponse.json(),
        categoriesResponse.json(),
      ]);
      if (!templatesResponse.ok) throw new Error(templatesData.error || "Load failed");
      if (!categoriesResponse.ok)
        throw new Error(categoriesData.error || "Categories could not be loaded");
      setItems(templatesData.items || []);
      setCategories(categoriesData.items || []);
    } catch (e) {
      console.error("Load Error:", e);
      toast.error(e.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openEdit = (item) => {
    setForm({ ...item });
    setEditing(item);
  };
  const close = () => {
    setEditing(null);
    setForm({});
  };

  const save = async () => {
    setSaving(true);
    try {
      const price = Math.max(0, Number(form.price) || 0);
      const discountPrice =
        form.discountPrice === null || form.discountPrice === ""
          ? null
          : Math.max(0, Number(form.discountPrice) || 0);
      if (discountPrice !== null && discountPrice > price) {
        throw new Error("Discount price cannot be higher than the base price");
      }
      const payablePrice = effectivePrice({ ...form, price, discountPrice });
      const payload = {
        ...form,
        price,
        discountPrice,
        isPremium: payablePrice > 0 ? !!form.isPremium : false,
      };
      const r = await fetch(`/api/admin/templates/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      toast.success("Updated — live on customer site");
      close();
      load();
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const filtered = q
    ? items.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div data-testid="templates-admin-page">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-[20px] text-slate-900 dark:text-slate-100">
            Templates
          </h2>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
            Templates are shipped with the app code. Here you can toggle visibility, set
            pricing/discount, and reorder — but not create new designs.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-10 w-[240px] pl-9 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 outline-none text-sm"
            data-testid="templates-search"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No templates yet. They'll appear here once the app initializes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {[
                    "Cover",
                    "Title",
                    "Category",
                    "Price",
                    "Discount",
                    "Badge",
                    "Premium",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 font-semibold text-slate-600 text-[11.5px] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    data-testid={`tpl-row-${t.id}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      {t.photo ? (
                        <img src={t.photo} alt="" className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100" />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.label}
                        {t.sub ? ` · ${t.sub}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {t.category || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      ₹{t.price ?? 0}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {t.discountPrice === 0 ? (
                        <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          FREE
                        </span>
                      ) : t.discountPrice != null ? (
                        <span className="font-semibold text-[#6d4aff]">₹{t.discountPrice}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {t.badge ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badge === "Popular" ? "bg-purple-100 text-[#6d4aff]" : t.badge === "New" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {t.badge}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {t.isPremium ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
                          Premium
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Free tier</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full ${t.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                      >
                        {t.active ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        data-testid={`tpl-edit-${t.id}`}
                        onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-[12px] text-slate-700 dark:text-slate-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-6"
            onClick={close}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-[16px] text-slate-900 dark:text-slate-100">
                    Edit template
                  </div>
                  <div className="text-[11.5px] text-slate-500 dark:text-slate-400">
                    {editing.title}
                  </div>
                </div>
                <button
                  onClick={close}
                  className="w-9 h-9 grid place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Preview */}
                {form.photo && (
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] max-w-[200px] mx-auto shadow-lg">
                    <img src={form.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <Row label="Template Title">
                  <input
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inp}
                    data-testid="tpl-field-title"
                  />
                </Row>
                <Row label="Cover Image URL">
                  <input
                    type="url"
                    value={form.photo || ""}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    className={inp}
                    data-testid="tpl-field-photo"
                  />
                  <MediaPicker
                    className="mt-2"
                    value={form.photo || ""}
                    onSelect={(url) => setForm({ ...form, photo: url })}
                    buttonLabel="Choose cover from Media Library"
                  />
                </Row>
                <Row label="Page Count">
                  <input
                    type="number"
                    min={1}
                    value={form.pages ?? 1}
                    onChange={(e) =>
                      setForm({ ...form, pages: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className={inp}
                    data-testid="tpl-field-pages"
                  />
                </Row>

                <Row label="Card Label">
                  <input
                    value={form.label || ""}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className={inp}
                    data-testid="tpl-field-label"
                  />
                </Row>
                <Row label="Subtitle">
                  <input
                    value={form.sub || ""}
                    onChange={(e) => setForm({ ...form, sub: e.target.value })}
                    className={inp}
                    data-testid="tpl-field-sub"
                  />
                </Row>

                <div className="grid grid-cols-2 gap-3">
                  <Row label="Base Price (₹)">
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        value={form.price ?? 0}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        className={`${inp} pl-9`}
                        data-testid="tpl-field-price"
                      />
                    </div>
                  </Row>
                  <Row label="Customer Price (₹) — blank = base price, 0 = free">
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        value={form.discountPrice ?? ""}
                        placeholder="Use base price"
                        onChange={(e) => {
                          const discountPrice =
                            e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0);
                          setForm({
                            ...form,
                            discountPrice,
                            isPremium: discountPrice === 0 ? false : form.isPremium,
                          });
                        }}
                        className={`${inp} pl-9`}
                        data-testid="tpl-field-discount"
                      />
                    </div>
                  </Row>
                </div>

                <Row label="Category">
                  <select
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inp}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Badge">
                  <select
                    value={form.badge || ""}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className={inp}
                  >
                    {BADGE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o || "— none —"}
                      </option>
                    ))}
                  </select>
                </Row>
                <Row label="Display Order (lower = first)">
                  <input
                    type="number"
                    value={form.order ?? 0}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className={inp}
                  />
                </Row>

                <div className="grid grid-cols-2 gap-3">
                  <ToggleField
                    label="Paid premium template"
                    value={!!form.isPremium}
                    onChange={(v) =>
                      setForm({ ...form, isPremium: effectivePrice(form) > 0 ? v : false })
                    }
                    testId="tpl-field-premium"
                    disabled={effectivePrice(form) === 0}
                  />
                  <ToggleField
                    label="Active on site"
                    value={form.active !== false}
                    onChange={(v) => setForm({ ...form, active: v })}
                    testId="tpl-field-active"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-end gap-2">
                <button
                  onClick={close}
                  className="h-10 px-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  data-testid="tpl-save-btn"
                  className="h-10 px-5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white text-[13px] font-semibold shadow-lg shadow-purple-500/25 inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}{" "}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inp =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#6d4aff] focus:ring-2 focus:ring-purple-100 outline-none text-[13.5px] text-slate-800 dark:text-slate-100";
const Row = ({ label, children }) => (
  <div>
    <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);
const ToggleField = ({ label, value, onChange, testId, disabled = false }) => (
  <Row label={label}>
    <label
      className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        data-testid={testId}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span className="w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-gradient-to-r peer-checked:from-[#6d4aff] peer-checked:to-[#8b5cf6] relative transition">
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
        />
      </span>
      <span className="text-[13px] text-slate-600 dark:text-slate-300">
        {value ? "Enabled" : "Disabled"}
      </span>
    </label>
  </Row>
);

export const Route = createFileRoute("/admin/templates")({
  head: () => ({
    meta: [
      { title: "Templates — WishFly Admin Console" },
      {
        name: "description",
        content:
          "Manage WishFly template visibility, pricing, discounts, badges and display order.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Templates — WishFly Admin Console" },
      {
        property: "og:description",
        content: "Manage WishFly template visibility, pricing and ordering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TemplatesAdminPage,
});
