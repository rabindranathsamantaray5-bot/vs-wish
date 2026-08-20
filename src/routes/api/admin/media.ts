import { createFileRoute } from "@tanstack/react-router";
import { getAdminMedia, postAdminMedia } from "@/lib/admin-data.functions";
import { uploadAdminMedia } from "@/lib/media.functions";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await getAdminMedia();
          return ok({ items });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          // Check if it's multipart (file upload) or JSON
          const contentType = request.headers.get("content-type") || "";

          if (contentType.includes("multipart/form-data")) {
            const item = await uploadAdminMedia(); // Calls getRequest() internally
            return ok({ item });
          } else {
            const body = await request.json();
            const item = await postAdminMedia({ data: body });
            return ok({ item });
          }
        } catch (e: any) {
          if (e instanceof Response) return e;
          return ok({ error: e.message }, 500);
        }
      },
    },
  },
});
