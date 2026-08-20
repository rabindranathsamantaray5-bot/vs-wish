import { createFileRoute } from "@tanstack/react-router";
import { getPublicClient, mapCategory } from "@/lib/catalog.server";

export const Route = createFileRoute("/api/public/categories")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const supabase = getPublicClient();
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("active", true)
            .order("order", { ascending: true });

          if (error) throw error;
          const items = (data ?? []).map(mapCategory);
          return new Response(JSON.stringify({ items }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
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
