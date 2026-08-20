import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          body = {};
        }
        const email = String(body.email || "")
          .trim()
          .toLowerCase();
        const password = String(body.password || "").trim();

        if (!email || !password) {
          return json({ error: "Email and password are required" }, 400);
        }

        // Authenticate via Supabase
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !authData.user) {
          return json({ error: authError?.message || "Invalid credentials" }, 401);
        }

        // Check if user has admin role
        const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
          _user_id: authData.user.id,
          _role: "admin",
        });

        if (roleError || !isAdmin) {
          // If not admin, sign out the user (they shouldn't have been signed in for admin panel)
          await supabaseAdmin.auth.signOut();
          return json({ error: "Forbidden: Admin access required" }, 403);
        }

        return json(
          {
            email: authData.user.email,
            role: "admin",
            session: authData.session,
          },
          200,
        );
      },
    },
  },
});
