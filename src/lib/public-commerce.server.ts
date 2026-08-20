import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function listPublicPlans() {
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("id,name,slug,description,price,currency,billing_period,features,display_order")
    .eq("is_active", true)
    .eq("is_visible", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function calculateCouponQuote(code: string, amount: number) {
  const normalizedCode = code.trim().toUpperCase();
  const originalAmount = Math.max(0, Number(amount) || 0);
  if (!normalizedCode) throw new Error("Enter a coupon code");

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .ilike("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!coupon) throw new Error("Coupon is invalid or inactive");

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now)
    throw new Error("Coupon is not active yet");
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now)
    throw new Error("Coupon has expired");
  if (coupon.usage_limit != null && (coupon.usage_count || 0) >= coupon.usage_limit)
    throw new Error("Coupon usage limit has been reached");
  if (originalAmount < Number(coupon.minimum_amount || 0))
    throw new Error(`Minimum purchase amount is ₹${Number(coupon.minimum_amount || 0)}`);

  let discount =
    coupon.discount_type === "percentage"
      ? (originalAmount * Number(coupon.discount_value || 0)) / 100
      : Number(coupon.discount_value || 0);
  if (coupon.maximum_discount != null) {
    discount = Math.min(discount, Number(coupon.maximum_discount));
  }
  discount = Math.max(0, Math.min(originalAmount, discount));

  return {
    code: coupon.code,
    description: coupon.description || "",
    originalAmount,
    discount: Number(discount.toFixed(2)),
    finalAmount: Number((originalAmount - discount).toFixed(2)),
  };
}
