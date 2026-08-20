import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isRazorpayConfigured } from "@/lib/razorpay.server";

/**
 * Maps Supabase Purchase row to Frontend Object
 */
export const mapDbPurchaseToFrontend = (dbPurchase: any) => {
  if (!dbPurchase) return null;

  return {
    id: dbPurchase.id,
    templateId: dbPurchase.template_id,
    price: dbPurchase.amount,
    currency: "INR",
    status: dbPurchase.status,
    createdAt: dbPurchase.created_at,
    template: dbPurchase.templates
      ? {
          title: dbPurchase.templates.title,
          photo: dbPurchase.templates.photo,
        }
      : null,
  };
};

/**
 * Fetch a template by ID and calculate the correct current price.
 * Server-side source of truth for pricing.
 */
export async function getTemplatePriceInfo(templateId: string) {
  const { data: template, error } = await supabaseAdmin
    .from("templates")
    .select("price, discount_price, is_premium, active")
    .eq("id", templateId)
    .single();

  if (error || !template) {
    throw new Error("Template not found or inactive");
  }

  const price = Number(template.price || 0);
  const discountPrice =
    template.discount_price == null ? null : Math.max(0, Number(template.discount_price));
  // An explicit customer/discount price is the amount the customer pays.
  // `null` means use base price; `0` means the template is free.
  const finalPrice = discountPrice == null ? price : discountPrice;
  const isFree = finalPrice === 0;

  return {
    price,
    discountPrice,
    finalPrice,
    isFree,
    isPremium: finalPrice > 0 && !!template.is_premium,
    isActive: !!template.active,
    paymentsConfigured: isRazorpayConfigured(),
    paymentProvider: isRazorpayConfigured() ? "razorpay" : null,
  };
}

/**
 * Check if a user has access to a template (either free or purchased)
 */
export async function checkTemplateAccess(userId: string | null, templateId: string) {
  const priceInfo = await getTemplatePriceInfo(templateId);

  if (priceInfo.isFree) return true;
  if (!userId) return false;

  const { data: purchase, error } = await supabaseAdmin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .in("status", ["completed", "claimed"])
    .maybeSingle();

  return !!purchase;
}

/**
 * Fetch purchases for a specific user
 */
export async function fetchUserPurchases(userId: string) {
  const { data: purchases, error } = await supabaseAdmin
    .from("purchases")
    .select(
      `
      *,
      templates (
        title,
        photo
      )
    `,
    )
    .eq("user_id", userId)
    .in("status", ["completed", "claimed"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user purchases:", error);
    return [];
  }

  return (purchases || []).map(mapDbPurchaseToFrontend);
}

/** Record a verified zero-value/free entitlement. Paid purchases use the Razorpay flow. */
export async function recordPurchase(userId: string, templateId: string, amount: number) {
  const { data: existing } = await supabaseAdmin
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("template_id", templateId)
    .in("status", ["completed", "claimed"])
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from("purchases")
    .insert({
      user_id: userId,
      template_id: templateId,
      amount,
      status: "completed",
    })
    .select()
    .single();

  if (error) {
    const { data: raced } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("template_id", templateId)
      .in("status", ["completed", "claimed"])
      .maybeSingle();
    if (raced) return raced;
    throw error;
  }
  return data;
}
