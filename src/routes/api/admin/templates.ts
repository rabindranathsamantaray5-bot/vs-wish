import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRole } from "@/lib/admin-auth.server";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/templates")({
  server: {
    handlers: {
      // Real Supabase list — ordered by order asc, created_at desc
      GET: async ({ request }) => {
        try {
          await verifyAdminRole();
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { mapTemplate, loadCategoryMaps } = await import("@/lib/catalog.server");
          const maps = await loadCategoryMaps(supabaseAdmin as never);
          const { data, error } = await supabaseAdmin
            .from("templates")
            .select("*")
            .order("order", { ascending: true })
            .order("created_at", { ascending: false });
          if (error) return ok({ error: `Database error: ${error.message}` }, 500);
          const items = (data ?? []).map((row) => mapTemplate(row, maps.byId));
          return ok({ items });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("Templates API Error:", e);
          return ok({ error: e.message || "Internal Server Error" }, 500);
        }
      },
      POST: async ({ request }) => {
        await verifyAdminRole();
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { mapTemplate, toTemplateColumns, loadCategoryMaps } =
          await import("@/lib/catalog.server");
        const maps = await loadCategoryMaps(supabaseAdmin as never);
        const payload = { active: true, order: 0, ...toTemplateColumns(body, maps.byName) };
        const { data, error } = await supabaseAdmin
          .from("templates")
          .insert(payload as never)
          .select("*")
          .single();
        if (error) return ok({ error: error.message }, 400);
        return ok({ item: mapTemplate(data, maps.byId) });
      },
    },
  },
});
