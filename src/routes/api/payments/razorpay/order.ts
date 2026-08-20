import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { createTemplatePayment } from "@/lib/payments.server";

const inputSchema = z.object({
  templateId: z.string().uuid(),
  couponCode: z.string().trim().max(50).optional(),
});

export const Route = createFileRoute("/api/payments/razorpay/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await getAuthenticatedUser(request);
          if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
          const body = inputSchema.parse(await request.json());
          const checkout = await createTemplatePayment({
            user: {
              id: user.id,
              email: user.email || "",
              name: user.name || "",
              phone: user.phone || "",
            },
            templateId: body.templateId,
            ...(body.couponCode ? { couponCode: body.couponCode } : {}),
          });
          return Response.json(checkout);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Payment order could not be created";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
