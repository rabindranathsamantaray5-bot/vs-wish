import { createFileRoute } from "@tanstack/react-router";
import { verifyAdminRole } from "@/lib/admin-auth.server";

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/admin/categories/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        await verifyAdminRole();
        const { id } = params;
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { mapCategory, toCategoryColumns } = await import("@/lib/catalog.server");
        const { data, error } = await supabaseAdmin
          .from("categories")
          .update(toCategoryColumns(body) as never)
          .eq("id", id)
          .select("*")
          .single();
        if (error) return ok({ error: error.message }, 400);
        return ok({ item: mapCategory(data) });
      },
      DELETE: async ({ params }) => {
        await verifyAdminRole();
        const { id } = params;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
        if (error) return ok({ error: error.message }, 400);
        return ok({ success: true });
      },
    },
  },
});
