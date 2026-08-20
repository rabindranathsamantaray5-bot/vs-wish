import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Eye, MessageSquare, ExternalLink, Loader2, Plus, Lock } from "lucide-react";
import { authenticatedFetch } from "@/lib/auth-client";

function MyWishesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch("/api/account/wishes")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  return (
    <div data-testid="my-wishes-page">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-[22px] text-slate-900 dark:text-slate-100">
            My Wishes
          </h2>
          <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
            All the wishes you've created — track views, comments, and share.
          </p>
        </div>
        <a
          href="/"
          className="h-10 px-4 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white text-[13px] font-semibold shadow inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Wish
        </a>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 grid place-items-center text-slate-500">
            <Heart className="w-7 h-7" />
          </div>
          <div className="mt-4 font-display font-bold text-[18px] text-slate-800 dark:text-slate-100">
            No wishes yet
          </div>
          <div className="text-[13px] text-slate-500 mt-1">
            Create your first personalized wish and share the joy.
          </div>
          <a
            href="/"
            className="inline-flex mt-5 h-11 px-6 rounded-full bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#ff5fa2] text-white font-semibold text-[14px] shadow-lg shadow-purple-500/25 items-center gap-2"
          >
            Create your first wish →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((w) => (
            <a
              key={w.id}
              href={`/wish/${w.id}`}
              target="_blank"
              rel="noreferrer"
              data-testid={`my-wish-${w.id}`}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 grid place-items-center text-2xl shrink-0">
                  🎁
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-bold text-[15px] text-slate-900 dark:text-slate-100 truncate">
                      {w.title}
                    </div>
                    {w.hasPassword && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="text-[11.5px] text-slate-500 mt-0.5">
                    For {w.recipient || "—"} · from {w.from || "—"}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11.5px] text-slate-500">
                    <span className="inline-flex items-center gap-0.5">
                      <Eye className="w-3.5 h-3.5" />
                      {w.views || 0} views
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {w.commentCount || 0}
                    </span>
                    <span className="text-slate-400 ml-auto">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/account/wishes")({
  component: MyWishesPage,
});
