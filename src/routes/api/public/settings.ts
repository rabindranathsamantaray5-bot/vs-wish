import { createFileRoute } from "@tanstack/react-router";
import { getPublicSettings } from "@/lib/public-settings.server";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/public/settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json(await getPublicSettings());
        } catch (error: any) {
          return json({ error: error.message || "Settings could not be loaded" }, 500);
        }
      },
    },
  },
});
