"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";

export function MediaPicker({
  onSelect,
  value = "",
  buttonLabel = "Choose from Media Library",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || items.length) return;
    setLoading(true);
    setError("");
    fetch("/api/public/media", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Media Library could not be loaded");
        setItems(data.items || []);
      })
      .catch((reason) => setError(reason.message || "Media Library could not be loaded"))
      .finally(() => setLoading(false));
  }, [open, items.length]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 ${className}`}
      >
        <ImageIcon className="h-4 w-4" />
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-display text-lg font-bold">Media Library</h2>
                <p className="text-xs text-slate-500">Select an asset managed by Admin.</p>
              </div>
              <button
                type="button"
                aria-label="Close Media Library"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-5">
              {loading ? (
                <div className="grid min-h-48 place-items-center text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
              ) : items.length === 0 ? (
                <div className="grid min-h-48 place-items-center text-center text-sm text-slate-500">
                  No image assets yet. Add one from Admin → Media Library.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.url, item);
                        setOpen(false);
                      }}
                      className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:border-purple-400 ${value === item.url ? "border-purple-500 ring-2 ring-purple-200" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      <img
                        src={item.url}
                        alt={item.title || "Media asset"}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="truncate px-2 py-2 text-xs font-semibold">
                        {item.title || item.type || "Media asset"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
