import { createFileRoute } from "@tanstack/react-router";
import { removeAdminMediaWithStorage } from "@/lib/media.functions";
import { patchAdminMedia } from "@/lib/admin-data.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/media/$id")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const body = await request.json();
          const item = await patchAdminMedia({ data: { id: params.id, ...body } });
          return ok({ item });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
      DELETE: async ({ params }) => {
        try {
          await removeAdminMediaWithStorage({ data: { id: params.id } });
          return ok({ success: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
