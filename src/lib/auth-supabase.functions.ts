import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getAuthenticatedUser } from "./auth.server";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const getSessionUser = createServerFn({ method: "GET" }).handler(async () => ({
  user: await getAuthenticatedUser(),
}));

export const updateProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    if (data.name !== undefined) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ name: data.name, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
    }

    const metadata = {
      ...user.user_metadata,
      ...(data.name !== undefined ? { full_name: data.name } : {}),
      ...(data.avatarUrl !== undefined ? { avatar_url: data.avatarUrl } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    };
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: metadata,
    });
    if (authError) throw authError;

    return {
      success: true,
      user: {
        ...user,
        name: data.name ?? user.name,
        avatarUrl: data.avatarUrl ?? user.avatarUrl,
        phone: data.phone ?? user.phone,
        user_metadata: metadata,
      },
    };
  });
