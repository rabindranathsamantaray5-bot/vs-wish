import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRole } from "@/lib/admin-auth.server";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/categories")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await verifyAdminRole();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { mapCategory } = await import("@/lib/catalog.server");
        const { data, error } = await supabaseAdmin
          .from("categories")
          .select("*")
          .order("order", { ascending: true });
        if (error) return ok({ error: error.message }, 500);
        return ok({ items: (data ?? []).map(mapCategory) || [] });
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
        const { mapCategory, toCategoryColumns } = await import("@/lib/catalog.server");
        const payload = { active: true, order: 0, ...toCategoryColumns(body) };
        const { data, error } = await supabaseAdmin
          .from("categories")
          .insert(payload as never)
          .select("*")
          .single();
        if (error) return ok({ error: error.message }, 400);
        return ok({ item: mapCategory(data) });
      },
    },
  },
});
