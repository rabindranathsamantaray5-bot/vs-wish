import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies if the current requester is an authenticated admin.
 * This is used in server functions and API routes.
 */
export async function verifyAdminRole() {
  const request = getRequest();
  if (!request) {
    throw new Response(
      JSON.stringify({ error: "Internal Server Error: No request context found" }),
      { status: 500 },
    );
  }

  // Get session from headers (TanStack Start attaches this via middleware)
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    throw new Response(JSON.stringify({ error: "Unauthorized: Missing Authorization header" }), {
      status: 401,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Response(
      JSON.stringify({ error: `Unauthorized: ${error?.message || "Invalid session"}` }),
      { status: 401 },
    );
  }

  // Check role using security definer function has_role
  // We use supabaseAdmin to bypass RLS for this specific check if needed,
  // but has_role is already security definer.
  const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (roleError || !isAdmin) {
    throw new Response(
      JSON.stringify({ error: `Forbidden: Admin role required. ${roleError?.message || ""}` }),
      { status: 403 },
    );
  }

  return user;
}
