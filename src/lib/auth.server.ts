import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function bearerToken(request: Request | undefined) {
  const header = request?.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function getAuthenticatedUser(request = getRequest()) {
  const token = bearerToken(request);
  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    ...user,
    name: profile?.name ?? user.user_metadata?.["full_name"] ?? "",
    avatarUrl: user.user_metadata?.["avatar_url"] ?? "",
    phone: user.user_metadata?.["phone"] ?? "",
  };
}
