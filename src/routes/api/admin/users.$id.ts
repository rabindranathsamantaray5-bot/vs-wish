import { createFileRoute } from "@tanstack/react-router";
import { patchAdminUser, removeAdminUser } from "@/lib/admin-data.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/users/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          let body: any = {};
          try {
            body = await request.json();
          } catch {
            body = {};
          }
          const item = await patchAdminUser({ data: { ...body, id: params.id } });
          return ok({ item });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
      DELETE: async ({ params }) => {
        try {
          const success = await removeAdminUser({ data: { id: params.id } });
          return ok({ success });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
