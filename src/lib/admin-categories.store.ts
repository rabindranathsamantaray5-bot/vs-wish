// MOCK categories store
export type CategoryDoc = {
  id: string;
  name: string;
  img: string;
  bg: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const nowIso = () => new Date().toISOString();

const SEED: Partial<CategoryDoc>[] = [
  {
    name: "Birthday",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png",
    bg: "from-purple-100 to-pink-100",
    order: 1,
  },
  {
    name: "Anniversary",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Ring/3D/ring_3d.png",
    bg: "from-amber-100 to-orange-100",
    order: 2,
  },
  {
    name: "Wedding",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wedding/3D/wedding_3d.png",
    bg: "from-rose-100 to-pink-100",
    order: 3,
  },
  {
    name: "Love",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkling%20heart/3D/sparkling_heart_3d.png",
    bg: "from-pink-100 to-rose-100",
    order: 4,
  },
  {
    name: "Baby Shower",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Baby/3D/baby_3d.png",
    bg: "from-sky-100 to-blue-100",
    order: 5,
  },
  {
    name: "Festivals",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fireworks/3D/fireworks_3d.png",
    bg: "from-fuchsia-100 to-purple-100",
    order: 6,
  },
  {
    name: "Invitations",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Love%20letter/3D/love_letter_3d.png",
    bg: "from-indigo-100 to-violet-100",
    order: 7,
  },
  {
    name: "Independence",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Flag%20india/3D/flag_india_3d.png",
    bg: "from-orange-100 to-green-100",
    order: 8,
  },
  {
    name: "Diwali",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Diya%20lamp/3D/diya_lamp_3d.png",
    bg: "from-amber-100 to-orange-100",
    order: 9,
  },
  {
    name: "Christmas",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Christmas%20tree/3D/christmas_tree_3d.png",
    bg: "from-emerald-100 to-green-100",
    order: 10,
  },
  {
    name: "New Year",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png",
    bg: "from-violet-100 to-purple-100",
    order: 11,
  },
  {
    name: "More",
    img: "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png",
    bg: "from-slate-100 to-gray-100",
    order: 12,
  },
];

const g = globalThis as unknown as { __wfCategories?: CategoryDoc[] };

if (!g.__wfCategories) {
  g.__wfCategories = SEED.map((c, i) => ({
    ...c,
    id: `cat-${String(i + 1).padStart(3, "0")}`,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })) as CategoryDoc[];
}

export const categoriesStore = g.__wfCategories!;

export function listCategories(): CategoryDoc[] {
  return [...categoriesStore].sort((a, b) => a.order - b.order);
}

export function createCategory(body: Record<string, unknown>): CategoryDoc {
  const doc = {
    id: `cat-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    active: true,
    order: categoriesStore.length + 1,
    name: "",
    img: "",
    bg: "",
    ...body,
  } as CategoryDoc;
  categoriesStore.push(doc);
  return doc;
}

export function updateCategory(id: string, body: Record<string, unknown>): CategoryDoc | null {
  const idx = categoriesStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const { id: _id, createdAt, ...rest } = body as Record<string, unknown>;
  const next = { ...categoriesStore[idx], ...rest, updatedAt: nowIso() } as CategoryDoc;
  categoriesStore[idx] = next;
  return next;
}

export function deleteCategory(id: string): boolean {
  const idx = categoriesStore.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  categoriesStore.splice(idx, 1);
  return true;
}
