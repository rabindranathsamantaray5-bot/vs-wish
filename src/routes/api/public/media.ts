import { createFileRoute } from "@tanstack/react-router";
import { getPublicClient } from "@/lib/catalog.server";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/public/media")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await getPublicClient()
            .from("media_library")
            .select("id,title,url,type,tags,attribution,created_at")
            .in("type", ["image", "gif", "sticker", "icon"])
            .order("created_at", { ascending: false });
          if (error) throw error;
          return json({ items: data || [] });
        } catch (error: any) {
          return json({ error: error.message || "Media Library could not be loaded" }, 500);
        }
      },
    },
  },
});
