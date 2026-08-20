import { createFileRoute } from "@tanstack/react-router";
import { getPublicClient, mapTemplate, loadCategoryMaps } from "@/lib/catalog.server";

export const Route = createFileRoute("/api/public/templates")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const offset = parseInt(url.searchParams.get("offset") || "0", 10);
          const limit = parseInt(url.searchParams.get("limit") || "10", 10);

          const supabase = getPublicClient();
          const maps = await loadCategoryMaps(supabase as any);

          const { data, error } = await supabase
            .from("templates")
            .select("*")
            .eq("active", true)
            .order("order", { ascending: true })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit);

          if (error) throw error;

          const hasMore = (data?.length || 0) > limit;
          const items = (data || []).slice(0, limit).map((row) => mapTemplate(row, maps.byId));

          return new Response(
            JSON.stringify({
              items,
              hasMore,
              nextOffset: hasMore ? offset + limit : null,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message || "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
