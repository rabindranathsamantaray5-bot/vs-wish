import { createFileRoute } from "@tanstack/react-router";
import { getAuthenticatedUser } from "@/lib/auth.server";

export const Route = createFileRoute("/api/public/auth-me")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.json({ user: await getAuthenticatedUser(request) }),
    },
  },
});
