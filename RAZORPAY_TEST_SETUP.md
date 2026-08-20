# Razorpay Test Mode Setup

The application uses server-created Razorpay Orders and unlocks a paid template only after both checkout-signature verification and a captured-payment lookup succeed.

## Local environment

Keep these values in `.env` only:

```env
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

`RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must never be prefixed with `VITE_`, committed, logged or returned to the browser. Only the Test Key ID is sent to Standard Checkout.

## Razorpay Dashboard

1. Switch the Dashboard to Test Mode.
2. Enable automatic payment capture.
3. Add a webhook pointing to `https://YOUR_PUBLIC_TEST_HOST/api/payments/razorpay/webhook`.
4. Copy the exact local `RAZORPAY_WEBHOOK_SECRET` value into the webhook secret field.
5. Subscribe to `payment.captured` and `payment.failed`.

Razorpay cannot call `localhost`; use a deployed HTTPS test host or a secure HTTPS tunnel for webhook testing. Browser checkout and callback verification can still be exercised locally.

## Verified flow

1. The authenticated customer clicks **Buy Now**.
2. The server reloads the template price and validates the coupon.
3. A pending purchase and Razorpay Order are created server-side.
4. The server stores the Razorpay Order ID in the pending purchase state.
5. Standard Checkout runs with the public Test Key ID.
6. The callback is checked against the server-stored Order ID with HMAC-SHA256.
7. The server fetches the Razorpay Order and Payment and requires matching customer/template/amount/currency plus `captured`/`paid` status.
8. The purchase transitions once to `completed`; only then does template access unlock.
9. Signed webhooks reconcile a captured payment if the browser callback is interrupted.

A `payment.failed` event is authenticated and acknowledged but does not close the pending Order, so the customer can retry. It never grants template access.

Plan/subscription checkout is separate from one-time template ownership and remains disabled until a plan entitlement/subscription schema is added.
