import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Loader2, Crown, Check, Clock, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { authenticatedFetch } from "@/lib/auth-client";

function MyPurchasesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch("/api/account/purchases")
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
    <div data-testid="my-purchases-page">
      <div className="mb-5">
        <h2 className="font-display font-bold text-[22px] text-slate-900 dark:text-slate-100">
          My Purchases
        </h2>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
          Templates you've unlocked. Use them any time you create a new wish.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 grid place-items-center text-amber-600">
            <Crown className="w-7 h-7" />
          </div>
          <div className="mt-4 font-display font-bold text-[18px] text-slate-800 dark:text-slate-100">
            No purchases yet
          </div>
          <div className="text-[13px] text-slate-500 mt-1">
            Explore templates and unlock the ones you love.
          </div>
          <Link
            to="/templates"
            className="inline-flex mt-5 h-11 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-[14px] items-center gap-2"
          >
            Browse templates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              data-testid={`purchase-${p.id}`}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              <div className="aspect-[3/2] bg-gradient-to-br from-purple-100 to-pink-100 relative">
                {p.template?.photo ? (
                  <img src={p.template.photo} className="w-full h-full object-cover" alt="" />
                ) : null}
                <div className="absolute top-2 left-2">
                  {p.status === "claimed" ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500 text-white inline-flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      Pending payment
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="font-display font-bold text-[15px] text-slate-900 dark:text-slate-100">
                  {p.template?.title || "Template"}
                </div>
                <div className="text-[11.5px] text-slate-500 mt-1">
                  Paid ₹{p.price} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
                {p.status === "claimed" && (
                  <Link
                    to="/templates"
                    className="mt-3 h-9 px-4 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#8b5cf6] text-white text-[12px] font-semibold inline-flex items-center gap-1 w-full justify-center"
                  >
                    Use template <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/account/purchases")({
  component: MyPurchasesPage,
});
