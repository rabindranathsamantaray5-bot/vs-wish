import { createFileRoute } from "@tanstack/react-router";
import {
  getAdminComments,
  patchAdminComment,
  removeAdminComment,
} from "@/lib/admin-features.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/comments")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await getAdminComments();
          return ok({ items });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
