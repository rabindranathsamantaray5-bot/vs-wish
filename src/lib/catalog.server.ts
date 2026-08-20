// Real Supabase data layer for Categories + Templates (Phase 2A).
// Server-only. Transforms PostgreSQL rows into the frozen frontend contract.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CategoryDTO = {
  id: string;
  name: string;
  img: string;
  bg: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TemplateDTO = {
  id: string;
  title: string;
  category: string;
  pages: number;
  badge: string;
  label: string;
  sub: string;
  photo: string;
  price: number;
  discountPrice: number | null;
  isPremium: boolean;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];

/** Publishable-key client for public (anon) reads — RLS applies as anon. */
export function getPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input as RequestInfo, { ...init, headers: h });
      },
    },
  });
}

export function mapCategory(row: CategoryRow): CategoryDTO {
  return {
    id: row.id,
    name: row.name ?? "",
    img: row.img ?? "",
    bg: row.bg ?? "",
    order: row.order ?? 0,
    active: row.active ?? true,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export function mapTemplate(row: TemplateRow, categoryNameById: Map<string, string>): TemplateDTO {
  return {
    id: row.id,
    title: row.title ?? "",
    category: (row.category_id && categoryNameById.get(row.category_id)) || "",
    pages: row.pages ?? 0,
    badge: row.badge ?? "",
    label: row.label ?? "",
    sub: row.sub ?? "",
    photo: row.photo ?? "",
    price: Number(row.price ?? 0),
    discountPrice: row.discount_price == null ? null : Number(row.discount_price),
    isPremium: row.is_premium ?? false,
    order: row.order ?? 0,
    active: row.active ?? true,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

/** Frontend contract -> DB columns for categories. */
export function toCategoryColumns(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if ("name" in body) out["name"] = body["name"];
  if ("img" in body) out["img"] = body["img"];
  if ("bg" in body) out["bg"] = body["bg"];
  if ("order" in body) out["order"] = Number(body["order"] ?? 0);
  if ("active" in body) out["active"] = !!body["active"];
  return out;
}

/** Frontend contract -> DB columns for templates. `category` name resolves to category_id. */
export function toTemplateColumns(
  body: Record<string, unknown>,
  categoryIdByName: Map<string, string>,
) {
  const out: Record<string, unknown> = {};
  if ("title" in body) out["title"] = body["title"];
  if ("pages" in body) out["pages"] = Number(body["pages"] ?? 0);
  if ("badge" in body) out["badge"] = body["badge"];
  if ("label" in body) out["label"] = body["label"];
  if ("sub" in body) out["sub"] = body["sub"];
  if ("photo" in body) out["photo"] = body["photo"];
  if ("price" in body) out["price"] = Number(body["price"] ?? 0);
  if ("discountPrice" in body) {
    out["discount_price"] =
      body["discountPrice"] === null || body["discountPrice"] === ""
        ? null
        : Math.max(0, Number(body["discountPrice"] ?? 0));
  }
  if ("isPremium" in body) {
    const basePrice = Math.max(0, Number(body["price"] ?? 0));
    const payablePrice =
      body["discountPrice"] === null ||
      body["discountPrice"] === undefined ||
      body["discountPrice"] === ""
        ? basePrice
        : Math.max(0, Number(body["discountPrice"] ?? 0));
    out["is_premium"] = payablePrice > 0 && !!body["isPremium"];
  }
  if ("order" in body) out["order"] = Number(body["order"] ?? 0);
  if ("active" in body) out["active"] = !!body["active"];
  if ("category" in body) {
    const name = String(body["category"] ?? "")
      .trim()
      .toLowerCase();
    out["category_id"] = categoryIdByName.get(name) ?? null;
  }
  return out;
}

export async function loadCategoryMaps(client: {
  from: (t: "categories") => { select: (c: string) => Promise<{ data: any; error: any }> };
}) {
  const { data, error } = await client.from("categories").select("id, name");
  if (error) throw new Error(`Failed to load category maps: ${error.message}`);
  const rows = (data ?? []) as Array<{ id: string; name: string | null }>;
  const byId = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const r of rows) {
    byId.set(r.id, r.name ?? "");
    byName.set((r.name ?? "").trim().toLowerCase(), r.id);
  }
  return { byId, byName };
}
