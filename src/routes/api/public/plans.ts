import { createFileRoute } from "@tanstack/react-router";
import { listPublicPlans } from "@/lib/public-commerce.server";

export const Route = createFileRoute("/api/public/plans")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(
            { items: await listPublicPlans() },
            { headers: { "Cache-Control": "no-store" } },
          );
        } catch (error: any) {
          return Response.json(
            { error: error.message || "Plans could not be loaded" },
            { status: 500 },
          );
        }
      },
    },
  },
});
