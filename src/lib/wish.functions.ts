import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getAuthenticatedUser } from "./auth.server";
import {
  createWishInDb,
  fetchWishByIdOrSlug,
  unlockWishContent,
  verifyWishUnlockToken,
} from "./wish.server";

const identifierSchema = z.string().trim().min(1).max(100);
const wishInputSchema = z.object({
  recipient: z.string().trim().max(100).default(""),
  from: z.string().trim().max(100).default(""),
  title: z.string().trim().max(160).default("A special wish"),
  message: z.string().trim().min(1).max(5000),
  details: z.string().max(1000).default(""),
  photos: z.array(z.string().max(3_000_000)).max(6).default([]),
  music: z.string().max(2000).default(""),
  password: z.string().max(72).default(""),
  cover: z.string().max(3_000_000).default(""),
  eventDate: z.string().max(40).default(""),
  video: z.string().max(8_000_000).default(""),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,40}$/)
    .optional()
    .or(z.literal("")),
  theme: z.string().max(40).default("birthday"),
  templateId: z.string().uuid().nullable().optional(),
});
const commentSchema = z
  .object({
    id: identifierSchema,
    name: z.string().trim().min(1).max(100).default("Guest"),
    message: z.string().trim().max(400).default(""),
    reaction: z.string().max(16).default(""),
    unlockToken: z.string().max(256).optional(),
  })
  .refine((value) => value.message || value.reaction, {
    message: "A message or reaction is required",
  });

export const normalizeWish = (wish: Record<string, unknown> | null) => wish;

export const getWish = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.union([identifierSchema, z.object({ id: identifierSchema })]).parse(input),
  )
  .handler(async ({ data }) => {
    const identifier = typeof data === "string" ? data : data.id;
    return (
      (await fetchWishByIdOrSlug(identifier)) ?? {
        error: `Wish not found: ${identifier}`,
      }
    );
  });

export const unlockWish = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ id: identifierSchema, password: z.string().min(1).max(72) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await unlockWishContent(data.id, data.password);
    if ("error" in result) return result;
    return { ...result.wish, unlockToken: result.unlockToken };
  });

async function commentAccess(id: string, unlockToken?: string) {
  const { data: wish } = await supabaseAdmin
    .from("wishes")
    .select("id, user_id, password_hash")
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();
  if (!wish) return null;
  const userId = (await getAuthenticatedUser())?.id;
  const allowed =
    !wish.password_hash || userId === wish.user_id || verifyWishUnlockToken(wish.id, unlockToken);
  return allowed ? { wish, userId } : null;
}

export const getComments = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ id: identifierSchema, unlockToken: z.string().max(256).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const access = await commentAccess(data.id, data.unlockToken);
    if (!access) return { comments: [] };
    const { data: comments, error } = await supabaseAdmin
      .from("comments")
      .select("*")
      .eq("wish_id", access.wish.id)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return {
      comments: (comments ?? []).map((comment) => ({
        ...comment,
        createdAt: comment.created_at,
      })),
    };
  });

export const postComment = createServerFn({ method: "POST" })
  .validator((input: unknown) => commentSchema.parse(input))
  .handler(async ({ data }) => {
    const { getPublicSettings } = await import("./public-settings.server");
    if (!(await getPublicSettings()).features.commentsEnabled) {
      return { error: "Public comments are currently disabled by the administrator." };
    }
    const access = await commentAccess(data.id, data.unlockToken);
    if (!access) return { error: "Wish is private or unavailable" };
    const { data: comment, error } = await supabaseAdmin
      .from("comments")
      .insert({
        wish_id: access.wish.id,
        user_id: access.userId ?? null,
        name: data.name,
        message: data.message || null,
        reaction: data.reaction || null,
        moderation_status: "approved",
      })
      .select()
      .single();
    if (error) throw error;
    return { comment: { ...comment, createdAt: comment.created_at } };
  });

export const postReaction = postComment;

export const createWish = createServerFn({ method: "POST" })
  .validator((input: unknown) => wishInputSchema.parse(input))
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser();
    if (!user) return { error: "Please sign in before publishing a wish." };

    if (data.templateId) {
      const { checkTemplateAccess } = await import("./purchases.server");
      if (!(await checkTemplateAccess(user.id, data.templateId))) {
        return { error: "Purchase this template before publishing a wish." };
      }
    }

    const wish = await createWishInDb(data, user.id);
    return { id: wish.id, url: `/wish/${wish.slug || wish.id}` };
  });
