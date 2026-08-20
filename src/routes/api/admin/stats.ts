import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRole } from "@/lib/admin-auth.server";
import { getAdminDashboardStats } from "@/lib/admin-features.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await verifyAdminRole();
          return json(await getAdminDashboardStats());
        } catch (error: unknown) {
          const status = error instanceof Response ? error.status : 500;
          return json(
            {
              error:
                status === 401 || status === 403 ? "Unauthorized" : "Unable to load statistics",
            },
            status,
          );
        }
      },
    },
  },
});
