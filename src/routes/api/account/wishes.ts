import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/account/wishes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { getAuthenticatedUser } = await import("../../../lib/auth.server");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { getCommentCounts } = await import("../../../lib/wish.server");

          const user = await getAuthenticatedUser(request);

          if (!user) {
            return new Response(JSON.stringify({ items: [] }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { data: wishes, error } = await supabaseAdmin
            .from("wishes")
            .select(
              `
              id,
              slug,
              title,
              recipient,
              from_name,
              message,
              template_id,
              password_hash,
              views,
              event_date,
              created_at,
              updated_at
            `,
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            return new Response(JSON.stringify({ items: [] }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          const wishIds = (wishes || []).map((w) => w.id);
          const commentCounts = await getCommentCounts(wishIds);

          const items = (wishes || []).map((w) => ({
            id: w.id,
            slug: w.slug,
            title: w.title,
            recipient: w.recipient,
            from: w.from_name,
            message: w.message,
            templateId: w.template_id,
            hasPassword: !!w.password_hash,
            views: w.views || 0,
            commentCount: commentCounts[w.id] || 0,
            eventDate: w.event_date,
            createdAt: w.created_at,
            updatedAt: w.updated_at,
          }));

          return new Response(JSON.stringify({ items }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Internal Server Error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
