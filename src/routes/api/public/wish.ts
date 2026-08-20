import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchWishByIdOrSlug } from "@/lib/wish.server";

async function respond(identifier: string) {
  try {
    const wish = await fetchWishByIdOrSlug(identifier);
    if (!wish) return Response.json({ error: `Wish not found: ${identifier}` }, { status: 404 });

    void supabaseAdmin.rpc("increment_wish_view", { wish_id: wish.id }).then(({ error }) => {
      if (error) console.error("Failed to increment wish views:", error);
    });
    return Response.json(wish);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return Response.json({ error: message }, { status: 400 });
  }
}

export const Route = createFileRoute("/api/public/wish")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const identifier = new URL(request.url).searchParams.get("id")?.trim();
        return identifier
          ? respond(identifier)
          : Response.json({ error: "Wish id is required" }, { status: 400 });
      },
      POST: async ({ request }) => {
        const body = (await request.json()) as { id?: unknown };
        const identifier = typeof body.id === "string" ? body.id.trim() : "";
        return identifier
          ? respond(identifier)
          : Response.json({ error: "Wish id is required" }, { status: 400 });
      },
    },
  },
});
