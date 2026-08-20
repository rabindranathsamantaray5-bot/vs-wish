import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { verifyTemplatePayment } from "@/lib/payments.server";

const inputSchema = z.object({
  purchaseId: z.string().uuid(),
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

export const Route = createFileRoute("/api/payments/razorpay/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await getAuthenticatedUser(request);
          if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
          const body = inputSchema.parse(await request.json());
          const result = await verifyTemplatePayment({
            userId: user.id,
            purchaseId: body.purchaseId,
            orderId: body.razorpay_order_id,
            paymentId: body.razorpay_payment_id,
            signature: body.razorpay_signature,
          });
          return Response.json(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Payment verification failed";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
