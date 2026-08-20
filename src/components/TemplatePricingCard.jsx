import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ShoppingBag,
  Sparkles,
  FileText,
  Check,
  Loader2,
  Eye,
  Heart,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getTemplateAccess } from "@/lib/purchases.functions";
import { getAuthHeaders } from "@/lib/auth-client";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

let razorpayScriptPromise;
function loadRazorpayCheckout() {
  if (typeof window === "undefined") return Promise.reject(new Error("Checkout needs a browser"));
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay Checkout could not be loaded"));
      document.head.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

// Skeleton Loader Component
const PricingSkeleton = () => (
  <div className="flex flex-col items-end gap-1.5">
    <div className="w-12 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="w-16 h-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
  </div>
);

export const TemplatePricingCard = ({ t, onOpenPreview, onOpenBuilder, variant = "default" }) => {
  const { site } = usePublicSettings();
  const fetchAccess = useServerFn(getTemplateAccess);
  const queryClient = useQueryClient();
  const [buying, setBuying] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponQuote, setCouponQuote] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const {
    data: access,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["template-access", t.id],
    queryFn: async () =>
      t.id
        ? fetchAccess({ data: { templateId: t.id }, headers: await getAuthHeaders() })
        : Promise.reject("No template ID"),
    enabled: !!t.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const onBuy = async (e) => {
    e.stopPropagation();
    setBuying(true);
    try {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.href = `/account/login?redirect=${redirect}`;
        return;
      }
      const orderResponse = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          templateId: t.id,
          couponCode: couponQuote ? couponQuote.code : undefined,
        }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Payment order could not be created");
      if (order.free || order.alreadyPurchased) {
        toast.success(order.message || "Template unlocked!");
        queryClient.invalidateQueries({ queryKey: ["template-access", t.id] });
        setBuying(false);
        return;
      }

      await loadRazorpayCheckout();
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: site.siteName,
        description: t.title,
        prefill: order.prefill,
        notes: { purchase_id: order.purchaseId, template_id: t.id },
        theme: { color: "#6d4aff", backdrop_color: "#0f172acc" },
        modal: {
          confirm_close: true,
          ondismiss: () => setBuying(false),
        },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
              body: JSON.stringify({ purchaseId: order.purchaseId, ...payment }),
            });
            const verified = await verifyResponse.json();
            if (!verifyResponse.ok)
              throw new Error(verified.error || "Payment verification failed");
            toast.success(
              order.testMode
                ? "Test payment verified — template unlocked"
                : "Payment verified — template unlocked",
            );
            await queryClient.invalidateQueries({ queryKey: ["template-access", t.id] });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed");
          } finally {
            setBuying(false);
          }
        },
      });
      checkout.on("payment.failed", (failure) => {
        toast.error(failure?.error?.description || "Payment failed. No access was granted.");
        setBuying(false);
      });
      checkout.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed. Please try again.");
      setBuying(false);
    }
  };

  // Determine pricing display values
  const p = access?.priceInfo || {
    price: t.price ?? 0,
    discountPrice: t.discountPrice ?? t.discount_price,
    isFree:
      (t.discountPrice ?? t.discount_price) != null
        ? Number(t.discountPrice ?? t.discount_price) === 0
        : Number(t.price ?? 0) === 0,
    paymentsConfigured: false,
  };
  const hasAccess = access?.hasAccess;
  const isFree = p.isFree;
  const paymentsConfigured = p.paymentsConfigured;
  const originalPrice = p.price || 0;
  const currentPrice = p.discountPrice != null ? p.discountPrice : originalPrice;
  const hasDiscount =
    p.discountPrice != null && p.discountPrice >= 0 && p.discountPrice < originalPrice;
  const offPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const applyCoupon = async (event) => {
    event.stopPropagation();
    setCouponLoading(true);
    setCouponError("");
    setCouponQuote(null);
    try {
      const response = await fetch("/api/public/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: currentPrice }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Coupon is invalid");
      setCouponQuote(data.quote);
      toast.success(`Coupon applied: save ₹${data.quote.discount}`);
    } catch (error) {
      setCouponError(error.message || "Coupon is invalid");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <motion.div
      data-testid={`template-card-${t.id}`}
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`group shrink-0 ${variant === "grid" ? "w-full" : "w-[210px] sm:w-[230px]"}`}
    >
      <div
        className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-soft ring-1 ring-slate-200/60 dark:ring-slate-700/60 cursor-pointer bg-slate-100 dark:bg-slate-800"
        onClick={() => onOpenPreview?.(t)}
      >
        <img
          src={t.photo}
          alt={t.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Discount Badge on Image */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="px-2.5 py-1 rounded-full bg-red-600 dark:bg-red-500 text-white text-[10px] font-black shadow-lg animate-pulse-glow border border-white/20">
              {offPercent}% OFF
            </div>
          </div>
        )}

        {/* Existing Badge Logic */}
        {t.badge && !hasDiscount && (
          <div
            className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg backdrop-blur border border-white/20 ${
              t.badge === "Popular"
                ? "bg-[#6d4aff] text-white"
                : t.badge === "New"
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                  : "bg-amber-600 dark:bg-amber-500 text-white"
            }`}
          >
            {t.badge}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 text-white pointer-events-none">
          <div
            className="font-display font-bold text-[18px] leading-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          >
            {t.label || t.title}
          </div>
          {t.sub && (
            <div className="text-[11px] opacity-95 mt-0.5 font-script text-lg">{t.sub}</div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/25 backdrop-blur grid place-items-center text-white hover:bg-white/40 transition"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Overlay CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
          <div className="flex gap-2">
            {hasAccess || isFree ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBuilder?.(t);
                }}
                className="flex-1 h-10 rounded-full bg-white text-slate-900 text-[13px] font-bold hover:bg-purple-50 transition inline-flex items-center justify-center gap-1.5 shadow-xl"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                Use Template
              </button>
            ) : (
              <button
                onClick={onBuy}
                disabled={buying || !paymentsConfigured}
                className="flex-1 h-10 rounded-full bg-gradient-to-r from-[#ff9f43] to-[#ff8c1a] text-white text-[13px] font-bold hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 shadow-xl"
              >
                {buying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                {paymentsConfigured ? "Buy Now" : "Payments unavailable"}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview?.(t);
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur grid place-items-center text-white hover:bg-white/30 transition shadow-lg"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info & Pricing Area */}
      <div className="mt-3.5 px-1 min-h-[64px] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[14px] text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {t.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 inline-flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5 opacity-70" />
              {t.pages || 10} Pages
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end min-h-[36px] justify-center">
            {isLoading ? (
              <PricingSkeleton />
            ) : isError ? (
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                <AlertCircle className="w-3 h-3" /> Error
              </div>
            ) : isFree ? (
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-widest">
                Free
              </span>
            ) : hasAccess ? (
              <div className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1 uppercase tracking-wider">
                <Check className="w-3 h-3" /> Purchased
              </div>
            ) : (
              <div className="flex flex-col items-end">
                {hasDiscount && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 line-through font-medium">
                    ₹{originalPrice}
                  </div>
                )}
                <div className="font-black text-[15px] text-[#5a39e6] dark:text-[#a58dff] leading-none mt-0.5">
                  ₹{currentPrice}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar for Paid/Discount templates */}
        {!isLoading && !hasAccess && !isFree && hasDiscount && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
              Save ₹{originalPrice - currentPrice} today
            </div>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-2" />
          </div>
        )}

        {!isLoading && !hasAccess && !isFree && (
          <div className="mt-2" onClick={(event) => event.stopPropagation()}>
            <div className="flex gap-1.5">
              <input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());
                  setCouponQuote(null);
                  setCouponError("");
                }}
                placeholder="Coupon code"
                aria-label={`Coupon code for ${t.title}`}
                className="h-8 min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-2.5 text-[10px] font-semibold uppercase outline-none focus:border-purple-400 dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={!couponCode.trim() || couponLoading}
                className="h-8 rounded-full bg-purple-100 px-2.5 text-[10px] font-bold text-purple-700 disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {couponLoading ? "…" : "Apply"}
              </button>
            </div>
            {couponQuote && (
              <div
                className="mt-1 text-[10px] font-bold text-emerald-600"
                data-testid="coupon-quote"
              >
                Pay ₹{couponQuote.finalAmount} · save ₹{couponQuote.discount}
              </div>
            )}
            {couponError && <div className="mt-1 text-[10px] text-rose-600">{couponError}</div>}
          </div>
        )}
      </div>
    </motion.div>
  );
};
