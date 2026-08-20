import { createFileRoute } from "@tanstack/react-router";
import { getAdminUsers, postAdminUser } from "@/lib/admin-data.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await getAdminUsers(undefined);
          if (!items) throw new Error("No users returned from data layer");
          return ok({ items });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("Users API Error:", e);
          return ok({ error: e.message || "Internal Server Error" }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            body = {};
          }
          const item = await postAdminUser({ data: body });
          return ok({ item });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
