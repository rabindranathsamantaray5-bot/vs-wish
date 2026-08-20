import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Crown, Heart, Loader2 } from "lucide-react";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

function PricingPage() {
  const { site } = usePublicSettings();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/public/plans", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Plans could not be loaded");
        setPlans(data.items || []);
      })
      .catch((reason) => setError(reason.message || "Plans could not be loaded"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SiteHeader active="/pricing" />
    <main className="px-4 pb-20 pt-32 sm:pt-40">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white">
            <Heart className="h-5 w-5 fill-current" />
          </span>
          {site.siteName}
        </Link>
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-purple-700">
            <Crown className="h-4 w-4" /> Pricing
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Choose your plan</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{site.tagline}</p>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : error ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-rose-50 p-5 text-center text-rose-700">
            {error}
          </div>
        ) : (
          <div
            className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            data-testid="public-plans"
          >
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-3xl border border-white bg-white/90 p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900/90"
              >
                <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                {plan.description && (
                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                )}
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-black">₹{Number(plan.price)}</span>
                  <span className="pb-1 text-sm text-slate-500">/{plan.billing_period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="mt-7 h-11 w-full rounded-full bg-slate-200 text-sm font-semibold text-slate-500 dark:bg-slate-800"
                >
                  {Number(plan.price) === 0 ? "Current free access" : "Secure checkout coming soon"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute("/pricing")({ component: PricingPage });
