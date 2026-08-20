import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.razorpay.com/v1";

export type RazorpayOrder = {
  id: string;
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  notes?: Record<string, string>;
};

export type RazorpayPayment = {
  id: string;
  entity: "payment";
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string;
  captured: boolean;
};

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getRazorpayConfig() {
  const provider = process.env["PAYMENT_PROVIDER"]?.trim().toLowerCase();
  const keyId = required("RAZORPAY_KEY_ID");
  const keySecret = required("RAZORPAY_KEY_SECRET");
  if (provider !== "razorpay") throw new Error("Razorpay payment provider is not enabled");
  return {
    keyId,
    keySecret,
    isTestMode: keyId.startsWith("rzp_test_"),
  };
}

export function isRazorpayConfigured() {
  try {
    getRazorpayConfig();
    return true;
  } catch {
    return false;
  }
}

async function razorpayRequest<T>(path: string, init: RequestInit = {}) {
  const { keyId, keySecret } = getRazorpayConfig();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Basic ${btoa(`${keyId}:${keySecret}`)}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const description =
      body?.error?.description || body?.error?.reason || "Razorpay request failed";
    throw new Error(description);
  }
  return body as T;
}

export function purchaseReceipt(purchaseId: string) {
  return `p_${purchaseId}`;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  purchaseId: string;
  userId: string;
  templateId: string;
  couponCode?: string;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: purchaseReceipt(input.purchaseId),
      notes: {
        purchase_id: input.purchaseId,
        user_id: input.userId,
        template_id: input.templateId,
        coupon_code: input.couponCode || "",
      },
    }),
  });
}

export function fetchRazorpayOrder(orderId: string) {
  return razorpayRequest<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

function safeEqualHex(leftHex: string, rightHex: string) {
  if (!/^[a-f0-9]+$/i.test(leftHex) || !/^[a-f0-9]+$/i.test(rightHex)) return false;
  const left = Buffer.from(leftHex, "hex");
  const right = Buffer.from(rightHex, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = getRazorpayConfig();
  const expected = createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = required("RAZORPAY_WEBHOOK_SECRET");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export function assertOrderBinding(
  order: RazorpayOrder,
  expected: { purchaseId: string; userId: string; templateId: string; amountPaise: number },
) {
  if (order.receipt !== purchaseReceipt(expected.purchaseId))
    throw new Error("Order receipt mismatch");
  if (order.notes?.["purchase_id"] !== expected.purchaseId)
    throw new Error("Order purchase mismatch");
  if (order.notes?.["user_id"] !== expected.userId) throw new Error("Order customer mismatch");
  if (order.notes?.["template_id"] !== expected.templateId)
    throw new Error("Order template mismatch");
  if (Number(order.amount) !== expected.amountPaise) throw new Error("Order amount mismatch");
  if (order.currency !== "INR") throw new Error("Order currency mismatch");
}
