import { createFileRoute } from "@tanstack/react-router";
import { reconcileCapturedPayment } from "@/lib/payments.server";
import { verifyWebhookSignature } from "@/lib/razorpay.server";

export const Route = createFileRoute("/api/payments/razorpay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") || "";
        try {
          if (!signature || !verifyWebhookSignature(rawBody, signature)) {
            return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
          }
          const event = JSON.parse(rawBody);
          if (event.event === "payment.captured") {
            const payment = event.payload?.payment?.entity;
            if (payment?.order_id && payment?.id) {
              await reconcileCapturedPayment(payment.order_id, payment.id);
            }
          }
          return Response.json({ received: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Webhook processing failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
