import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type WishPhoto = { order: number | null; url: string };
type WishRow = {
  id: string;
  slug: string;
  password_hash: string | null;
  template_id?: string | null;
  title?: string | null;
  recipient?: string | null;
  from_name?: string | null;
  message?: string | null;
  details?: string | null;
  theme?: string | null;
  cover_url?: string | null;
  music_url?: string | null;
  video_url?: string | null;
  event_date?: string | null;
  created_at?: string | null;
  views?: number | null;
  wish_photos?: WishPhoto[];
};

type WishInput = {
  slug?: string | undefined;
  templateId?: string | null | undefined;
  recipient?: string;
  from?: string;
  title?: string;
  message?: string;
  details?: string;
  theme?: string;
  cover?: string;
  music?: string;
  video?: string;
  eventDate?: string;
  photos?: string[];
  password?: string;
};

export const mapDbWishToFrontend = (dbWish: WishRow, photos: WishPhoto[] = []) => ({
  id: dbWish.id,
  slug: dbWish.slug,
  templateId: dbWish.template_id ?? "",
  title: dbWish.title ?? "",
  recipient: dbWish.recipient ?? "",
  from: dbWish.from_name ?? "",
  message: dbWish.message ?? "",
  details: dbWish.details ?? "",
  theme: dbWish.theme ?? "birthday",
  cover: dbWish.cover_url ?? "",
  music: dbWish.music_url ?? "",
  musicUrl: dbWish.music_url ?? "",
  narration: "",
  narrationUrl: "",
  video: dbWish.video_url ?? null,
  eventDate: dbWish.event_date ?? null,
  createdAt: dbWish.created_at,
  views: dbWish.views ?? 0,
  protected: Boolean(dbWish.password_hash),
  photos: [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((photo) => photo.url),
});

async function loadWish(identifier: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  let query = supabaseAdmin.from("wishes").select("*, wish_photos(*)");
  query = isUuid
    ? query.or(`id.eq.${identifier},slug.eq.${identifier}`)
    : query.eq("slug", identifier);
  const { data, error } = await query.maybeSingle();
  return error || !data ? null : (data as unknown as WishRow);
}

export async function fetchWishByIdOrSlug(identifier: string) {
  const wish = await loadWish(identifier);
  if (!wish) return null;
  if (wish.password_hash) {
    return {
      id: wish.id,
      slug: wish.slug,
      theme: wish.theme ?? "birthday",
      protected: true,
    };
  }
  const { wish_photos: photos = [], ...row } = wish;
  return mapDbWishToFrontend(row as WishRow, photos);
}

export async function unlockWishContent(identifier: string, password: string) {
  const wish = await loadWish(identifier);
  if (!wish) return { error: "Wish not found" } as const;
  if (!wish.password_hash) return { error: "This wish is not protected" } as const;
  if (!(await bcrypt.compare(password, wish.password_hash))) {
    return { error: "Incorrect password" } as const;
  }
  const { wish_photos: photos = [], ...row } = wish;
  return {
    wish: mapDbWishToFrontend(row as WishRow, photos),
    unlockToken: createWishUnlockToken(wish.id),
  };
}

function unlockSecret() {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!secret) throw new Error("Missing server unlock secret");
  return secret;
}

export function createWishUnlockToken(wishId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
  const payload = `${wishId}.${expiresAt}`;
  const signature = createHmac("sha256", unlockSecret()).update(payload).digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function verifyWishUnlockToken(wishId: string, token?: string) {
  if (!token) return false;
  const [expiresRaw, supplied] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!expiresAt || expiresAt < Math.floor(Date.now() / 1000) || !supplied) {
    return false;
  }
  const expected = createHmac("sha256", unlockSecret())
    .update(`${wishId}.${expiresAt}`)
    .digest("base64url");
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function createWishInDb(wishData: WishInput, userId: string) {
  const passwordHash = wishData.password ? await bcrypt.hash(wishData.password, 10) : null;
  const slug = String(wishData.slug || randomUUID().slice(0, 12));
  const { data: wish, error: wishError } = await supabaseAdmin
    .from("wishes")
    .insert({
      user_id: userId,
      template_id: wishData.templateId || null,
      slug,
      recipient: wishData.recipient || null,
      from_name: wishData.from || null,
      title: wishData.title || "A special wish",
      message: wishData.message || "",
      details: wishData.details || null,
      theme: wishData.theme || "birthday",
      cover_url: wishData.cover || null,
      music_url: wishData.music || null,
      video_url: wishData.video || null,
      event_date: wishData.eventDate || null,
      password_hash: passwordHash,
    })
    .select()
    .single();
  if (wishError || !wish) {
    throw new Error(wishError?.message || "Failed to create wish");
  }

  if (wishData.photos?.length) {
    const { error } = await supabaseAdmin
      .from("wish_photos")
      .insert(wishData.photos.map((url, order) => ({ wish_id: wish.id, url, order })));
    if (error) {
      await supabaseAdmin.from("wishes").delete().eq("id", wish.id);
      throw new Error(`Failed to save wish photos: ${error.message}`);
    }
  }
  return wish;
}

export async function getCommentCounts(wishIds: string[]) {
  if (!wishIds.length) return {};
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("wish_id")
    .in("wish_id", wishIds);
  if (error) return {};
  return (data ?? []).reduce<Record<string, number>>((counts, row) => {
    counts[row.wish_id] = (counts[row.wish_id] ?? 0) + 1;
    return counts;
  }, {});
}
