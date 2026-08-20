import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRole } from "@/lib/admin-auth.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const user = await verifyAdminRole();
          return json({
            id: user.id,
            email: user.email,
            role: "admin",
          });
        } catch (err: any) {
          const status = err instanceof Response ? err.status : 500;
          return json({ error: "Unauthorized" }, status);
        }
      },
    },
  },
});
