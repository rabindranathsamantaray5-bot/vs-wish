import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { calculateCouponQuote } from "@/lib/public-commerce.server";
import { checkTemplateAccess, getTemplatePriceInfo, recordPurchase } from "@/lib/purchases.server";
import {
  assertOrderBinding,
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayConfig,
  verifyCheckoutSignature,
} from "@/lib/razorpay.server";

const toPaise = (amount: number) => Math.round(Number(amount) * 100);

async function incrementCouponUsage(code: string) {
  if (!code) return;
  const { data } = await supabaseAdmin
    .from("coupons")
    .select("id,usage_count")
    .ilike("code", code)
    .maybeSingle();
  if (!data) return;
  await supabaseAdmin
    .from("coupons")
    .update({ usage_count: Number(data.usage_count || 0) + 1 })
    .eq("id", data.id);
}

export async function createTemplatePayment(input: {
  user: { id: string; email?: string; name?: string; phone?: string };
  templateId: string;
  couponCode?: string;
}) {
  const { keyId, isTestMode } = getRazorpayConfig();
  const priceInfo = await getTemplatePriceInfo(input.templateId);
  if (!priceInfo.isActive) throw new Error("Template is not available");

  if (await checkTemplateAccess(input.user.id, input.templateId)) {
    return { alreadyPurchased: true, success: true, message: "Template already unlocked" };
  }

  if (priceInfo.isFree) {
    await recordPurchase(input.user.id, input.templateId, 0);
    return { free: true, success: true, message: "Free template unlocked" };
  }

  let couponCode = "";
  let finalAmount = priceInfo.finalPrice;
  if (input.couponCode?.trim()) {
    const quote = await calculateCouponQuote(input.couponCode, priceInfo.finalPrice);
    couponCode = quote.code;
    finalAmount = quote.finalAmount;
  }

  if (finalAmount <= 0) {
    await recordPurchase(input.user.id, input.templateId, 0);
    await incrementCouponUsage(couponCode);
    return { free: true, success: true, message: "Template unlocked with coupon" };
  }

  const amountPaise = toPaise(finalAmount);
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
    throw new Error("Payable amount must be at least ₹1");
  }

  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("purchases")
    .insert({
      user_id: input.user.id,
      template_id: input.templateId,
      amount: amountPaise / 100,
      status: "creating_order",
    })
    .select("id,user_id,template_id,amount,status")
    .single();
  if (purchaseError || !purchase) throw purchaseError || new Error("Purchase could not be created");

  try {
    const order = await createRazorpayOrder({
      amountPaise,
      purchaseId: purchase.id,
      userId: input.user.id,
      templateId: input.templateId,
      couponCode,
    });
    const { error: statusError } = await supabaseAdmin
      .from("purchases")
      .update({ status: `pending_payment:${order.id}` })
      .eq("id", purchase.id)
      .eq("status", "creating_order");
    if (statusError) throw statusError;
    return {
      success: true,
      provider: "razorpay",
      testMode: isTestMode,
      keyId,
      purchaseId: purchase.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      prefill: {
        name: input.user.name || "",
        email: input.user.email || "",
        contact: input.user.phone || "",
      },
    };
  } catch (error) {
    await supabaseAdmin.from("purchases").delete().eq("id", purchase.id);
    throw error;
  }
}

export async function verifyTemplatePayment(input: {
  userId: string;
  purchaseId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { data: purchase, error } = await supabaseAdmin
    .from("purchases")
    .select("id,user_id,template_id,amount,status")
    .eq("id", input.purchaseId)
    .eq("user_id", input.userId)
    .single();
  if (error || !purchase || !purchase.template_id) throw new Error("Purchase was not found");

  const pendingPrefix = "pending_payment:";
  const purchaseStatus = purchase.status || "";
  const storedOrderId = purchaseStatus.startsWith(pendingPrefix)
    ? purchaseStatus.slice(pendingPrefix.length)
    : input.orderId;
  if (storedOrderId !== input.orderId) throw new Error("Payment order does not match server order");
  if (
    !verifyCheckoutSignature({
      orderId: storedOrderId,
      paymentId: input.paymentId,
      signature: input.signature,
    })
  ) {
    throw new Error("Payment signature verification failed");
  }

  const amountPaise = toPaise(Number(purchase.amount));
  const [order, payment] = await Promise.all([
    fetchRazorpayOrder(storedOrderId),
    fetchRazorpayPayment(input.paymentId),
  ]);
  assertOrderBinding(order, {
    purchaseId: purchase.id,
    userId: purchase.user_id,
    templateId: purchase.template_id,
    amountPaise,
  });
  if (payment.order_id !== order.id) throw new Error("Payment order mismatch");
  if (payment.amount !== amountPaise || payment.currency !== "INR")
    throw new Error("Payment amount mismatch");
  if (payment.status !== "captured" || !payment.captured || order.status !== "paid") {
    throw new Error("Payment is not captured. Enable automatic capture in Razorpay Test Mode.");
  }

  if (purchaseStatus === "completed" || purchaseStatus === "claimed") {
    return { success: true, alreadyVerified: true, templateId: purchase.template_id };
  }
  if (!purchaseStatus.startsWith(pendingPrefix))
    throw new Error("Purchase is not awaiting payment");

  const { data: completed, error: updateError } = await supabaseAdmin
    .from("purchases")
    .update({ status: "completed" })
    .eq("id", purchase.id)
    .eq("status", purchaseStatus)
    .select("id")
    .maybeSingle();
  if (updateError) throw updateError;
  if (completed) await incrementCouponUsage(order.notes?.["coupon_code"] || "");

  return { success: true, templateId: purchase.template_id };
}

export async function reconcileCapturedPayment(orderId: string, paymentId: string) {
  const [order, payment] = await Promise.all([
    fetchRazorpayOrder(orderId),
    fetchRazorpayPayment(paymentId),
  ]);
  const purchaseId = order.notes?.["purchase_id"] || "";
  const userId = order.notes?.["user_id"] || "";
  const templateId = order.notes?.["template_id"] || "";
  if (!purchaseId || !userId || !templateId) throw new Error("Payment order notes are incomplete");

  const { data: purchase, error } = await supabaseAdmin
    .from("purchases")
    .select("id,user_id,template_id,amount,status")
    .eq("id", purchaseId)
    .single();
  if (error || !purchase || !purchase.template_id)
    throw new Error("Webhook purchase was not found");
  const amountPaise = toPaise(Number(purchase.amount));
  assertOrderBinding(order, { purchaseId, userId, templateId, amountPaise });
  if (payment.order_id !== order.id || payment.amount !== amountPaise || payment.currency !== "INR")
    throw new Error("Webhook payment does not match purchase");
  if (payment.status !== "captured" || !payment.captured)
    throw new Error("Webhook payment is not captured");
  if (purchase.status === "completed" || purchase.status === "claimed") return { duplicate: true };
  if (purchase.status !== `pending_payment:${order.id}`)
    throw new Error("Webhook order does not match server order");

  const { data: completed, error: updateError } = await supabaseAdmin
    .from("purchases")
    .update({ status: "completed" })
    .eq("id", purchase.id)
    .eq("status", purchase.status)
    .select("id")
    .maybeSingle();
  if (updateError) throw updateError;
  if (completed) await incrementCouponUsage(order.notes?.["coupon_code"] || "");
  return { duplicate: !completed };
}
