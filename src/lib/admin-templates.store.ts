// MOCK admin templates store — mirrors the original MongoDB `templates` collection.
// Documents follow the original DEFAULT_TEMPLATES seed shape exactly.
export type TemplateDoc = {
  id: string;
  title: string;
  category: string;
  pages: number;
  badge: string;
  label: string;
  sub: string;
  photo: string;
  price: number;
  discountPrice: number;
  isPremium: boolean;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

const nowIso = () => new Date().toISOString();

const SEED = [
  {
    title: "Birthday Celebration",
    category: "Birthday",
    pages: 12,
    badge: "Popular",
    label: "Happy Birthday",
    sub: "For your loved one",
    photo:
      "https://images.pexels.com/photos/15211704/pexels-photo-15211704.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 199,
    discountPrice: 0,
    isPremium: false,
    order: 1,
  },
  {
    title: "Wedding Invitation",
    category: "Wedding",
    pages: 12,
    badge: "Popular",
    label: "Wedding Bells",
    sub: "Save the date",
    photo:
      "https://images.pexels.com/photos/32705154/pexels-photo-32705154.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 499,
    discountPrice: 299,
    isPremium: true,
    order: 2,
  },
  {
    title: "Anniversary Wishes",
    category: "Anniversary",
    pages: 10,
    badge: "New",
    label: "Happy Anniversary",
    sub: "Forever together",
    photo: "https://images.unsplash.com/photo-1589095181425-c038b3871b6a?w=500&fit=crop",
    price: 299,
    discountPrice: 149,
    isPremium: true,
    order: 3,
  },
  {
    title: "Independence Day",
    category: "Independence",
    pages: 8,
    badge: "Trending",
    label: "Jai Hind",
    sub: "Vande Mataram",
    photo:
      "https://images.pexels.com/photos/30649312/pexels-photo-30649312.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 99,
    discountPrice: 0,
    isPremium: false,
    order: 4,
  },
  {
    title: "Christmas Wishes",
    category: "Christmas",
    pages: 10,
    badge: "New",
    label: "Merry Christmas",
    sub: "Ho Ho Ho!",
    photo:
      "https://images.pexels.com/photos/724375/pexels-photo-724375.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 199,
    discountPrice: 0,
    isPremium: false,
    order: 5,
  },
  {
    title: "Baby Shower",
    category: "Baby Shower",
    pages: 10,
    badge: "Popular",
    label: "Baby Shower",
    sub: "A little one coming",
    photo:
      "https://images.pexels.com/photos/1682459/pexels-photo-1682459.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 349,
    discountPrice: 199,
    isPremium: true,
    order: 6,
  },
  {
    title: "New Year 2026",
    category: "New Year",
    pages: 8,
    badge: "",
    label: "Happy New Year",
    sub: "Cheers to 2026",
    photo: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=500&fit=crop",
    price: 149,
    discountPrice: 0,
    isPremium: false,
    order: 7,
  },
  {
    title: "Grand Opening",
    category: "Other",
    pages: 10,
    badge: "New",
    label: "Grand Opening",
    sub: "Big day!",
    photo: "https://images.unsplash.com/photo-1761475456154-6c5373bbd2bb?w=500&fit=crop",
    price: 599,
    discountPrice: 399,
    isPremium: true,
    order: 8,
  },
  {
    title: "Diwali Deepavali",
    category: "Diwali",
    pages: 10,
    badge: "Trending",
    label: "Shubh Deepavali",
    sub: "Festival of Lights",
    photo:
      "https://images.pexels.com/photos/6120451/pexels-photo-6120451.jpeg?auto=compress&cs=tinysrgb&w=500",
    price: 249,
    discountPrice: 99,
    isPremium: true,
    order: 9,
  },
  {
    title: "Festival Wishes",
    category: "Festivals",
    pages: 10,
    badge: "Popular",
    label: "Happy Festival",
    sub: "Celebrate together",
    photo: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=500&fit=crop",
    price: 199,
    discountPrice: 0,
    isPremium: false,
    order: 10,
  },
  {
    title: "Love & Romance",
    category: "Love",
    pages: 10,
    badge: "New",
    label: "Forever Yours",
    sub: "A love story",
    photo: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&fit=crop",
    price: 349,
    discountPrice: 199,
    isPremium: true,
    order: 11,
  },
  {
    title: "Golden Invitation",
    category: "Invitations",
    pages: 12,
    badge: "Popular",
    label: "You are Invited",
    sub: "Be our guest",
    photo: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=500&fit=crop",
    price: 249,
    discountPrice: 149,
    isPremium: true,
    order: 12,
  },
];

const g = globalThis as unknown as { __wfTemplates?: TemplateDoc[] };

if (!g.__wfTemplates) {
  g.__wfTemplates = SEED.map((t, i) => ({
    ...t,
    id: `tpl-${String(i + 1).padStart(2, "0")}`,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })) as TemplateDoc[];
}

export const store = g.__wfTemplates!;

// Mirrors crudList('templates', {}, { order: 1, createdAt: -1 })
export function listTemplates(): TemplateDoc[] {
  return [...store].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || (b.createdAt > a.createdAt ? 1 : -1),
  );
}

// Mirrors crudCreate('templates', body, { active: true, order: 0 })
export function createTemplate(body: Record<string, unknown>): TemplateDoc {
  const doc = {
    id: Math.random().toString(36).slice(2, 14),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    active: true,
    order: 0,
    ...body,
  } as TemplateDoc;
  store.push(doc);
  return doc;
}

// Mirrors crudUpdate('templates', id, body)
export function updateTemplate(id: string, body: Record<string, unknown>): TemplateDoc | null {
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const { _id, id: _idBody, createdAt, ...rest } = body as Record<string, unknown>;
  const next = { ...store[idx], ...rest, updatedAt: nowIso() } as TemplateDoc;
  store[idx] = next;
  return next;
}

// Mirrors crudDelete('templates', id)
export function deleteTemplate(id: string): boolean {
  const idx = store.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

// Mirrors requireAdmin(request) using the existing mock wf_admin session cookie.
export function requireAdmin(request: Request): Response | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("wf_admin="))
    ?.split("=")[1];
  if (token !== "mock-admin-session") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
