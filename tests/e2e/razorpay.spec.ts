import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

function localEnv() {
  const values: Record<string, string> = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match?.[1] && match[2] !== undefined) {
      values[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return values;
}

const env = localEnv();
const supabaseUrl = env["SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
const razorpayKeyId = env["RAZORPAY_KEY_ID"];
const razorpayKeySecret = env["RAZORPAY_KEY_SECRET"];
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `razorpay-e2e-${runId}@example.com`;
const password = `Rzp-${runId}-Safe!`;

const serviceHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

test("Razorpay Test Mode creates a bound order and rejects a forged callback", async ({
  request,
}) => {
  test.slow();
  expect(razorpayKeyId).toMatch(/^rzp_test_/);
  expect(razorpayKeySecret).toBeTruthy();

  let userId = "";
  let purchaseId = "";
  try {
    const createUser = await request.post(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: serviceHeaders,
      data: { email, password, email_confirm: true, user_metadata: { full_name: "Razorpay E2E" } },
    });
    expect(createUser.ok()).toBeTruthy();
    userId = (await createUser.json()).id;

    const tokenResponse = await request.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      headers: { apikey: serviceKey, "Content-Type": "application/json" },
      data: { email, password },
    });
    expect(tokenResponse.ok()).toBeTruthy();
    const accessToken = (await tokenResponse.json()).access_token;
    const tokenPayload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"),
    );
    expect(tokenPayload.sub).toBe(userId);

    const catalog = await request.get(
      `${supabaseUrl}/rest/v1/templates?active=eq.true&select=id,price,discount_price&limit=100`,
      { headers: serviceHeaders },
    );
    expect(catalog.ok()).toBeTruthy();
    const paidTemplate = (await catalog.json()).find((item: any) => {
      const payable = item.discount_price == null ? item.price : item.discount_price;
      return Number(payable) >= 1;
    });
    expect(paidTemplate, "At least one active paid template is required").toBeTruthy();
    const expectedPaise = Math.round(
      Number(
        paidTemplate.discount_price == null ? paidTemplate.price : paidTemplate.discount_price,
      ) * 100,
    );

    const createOrder = await request.post("/api/payments/razorpay/order", {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { templateId: paidTemplate.id },
    });
    expect(createOrder.status()).toBe(200);
    const checkout = await createOrder.json();
    purchaseId = checkout.purchaseId;
    expect(checkout).toMatchObject({
      provider: "razorpay",
      testMode: true,
      keyId: razorpayKeyId,
      amount: expectedPaise,
      currency: "INR",
    });
    expect(checkout.orderId).toMatch(/^order_/);

    const basic = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    const providerOrder = await request.get(
      `https://api.razorpay.com/v1/orders/${checkout.orderId}`,
      { headers: { Authorization: `Basic ${basic}` } },
    );
    expect(providerOrder.ok()).toBeTruthy();
    expect(await providerOrder.json()).toMatchObject({
      id: checkout.orderId,
      amount: expectedPaise,
      currency: "INR",
      receipt: `p_${purchaseId}`,
      notes: {
        purchase_id: purchaseId,
        user_id: userId,
        template_id: paidTemplate.id,
      },
    });

    const forged = await request.post("/api/payments/razorpay/verify", {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        purchaseId,
        razorpay_order_id: checkout.orderId,
        razorpay_payment_id: "pay_forged_test_value",
        razorpay_signature: "0".repeat(64),
      },
    });
    expect(forged.status()).toBe(400);
    expect((await forged.json()).error).toContain("signature verification failed");

    const pending = await request.get(
      `${supabaseUrl}/rest/v1/purchases?id=eq.${purchaseId}&select=status,user_id`,
      { headers: serviceHeaders },
    );
    const pendingPurchase = (await pending.json())[0];
    expect(pendingPurchase.status).toBe(`pending_payment:${checkout.orderId}`);
    expect(pendingPurchase.user_id).toBe(userId);
  } finally {
    if (purchaseId) {
      await request.delete(`${supabaseUrl}/rest/v1/purchases?id=eq.${purchaseId}`, {
        headers: serviceHeaders,
      });
    }
    if (userId) {
      await request.delete(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        headers: serviceHeaders,
      });
    }
  }
});

test("Razorpay webhook rejects an invalid signature", async ({ request }) => {
  const response = await request.post("/api/payments/razorpay/webhook", {
    headers: { "x-razorpay-signature": "0".repeat(64) },
    data: {
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_forged", order_id: "order_forged" } } },
    },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: "Invalid webhook signature" });
});
