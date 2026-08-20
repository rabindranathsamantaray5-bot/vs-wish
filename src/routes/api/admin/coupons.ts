import { createFileRoute } from "@tanstack/react-router";
import { getAdminCoupons, postAdminCoupon } from "@/lib/admin-features.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/coupons")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await getAdminCoupons();
          return ok({ items });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const item = await postAdminCoupon({ data: body });
          return ok({ item });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
