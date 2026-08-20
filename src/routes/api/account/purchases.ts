import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/account/purchases")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { getAuthenticatedUser } = await import("@/lib/auth.server");
          const { fetchUserPurchases } = await import("@/lib/purchases.server");
          const user = await getAuthenticatedUser(request);
          if (!user) {
            return new Response(JSON.stringify({ items: [] }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
          const result = { items: await fetchUserPurchases(user.id) };

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Internal Server Error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
