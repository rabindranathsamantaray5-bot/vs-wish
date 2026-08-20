import { createFileRoute } from "@tanstack/react-router";
import { calculateCouponQuote } from "@/lib/public-commerce.server";

export const Route = createFileRoute("/api/public/coupons/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const quote = await calculateCouponQuote(String(body.code || ""), Number(body.amount));
          return Response.json({ valid: true, quote });
        } catch (error: any) {
          return Response.json(
            { valid: false, error: error.message || "Coupon validation failed" },
            { status: 400 },
          );
        }
      },
    },
  },
});
