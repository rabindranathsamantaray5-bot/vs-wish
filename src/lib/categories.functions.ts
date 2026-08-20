import { createServerFn } from "@tanstack/react-start";
import { getPublicClient, mapCategory } from "./catalog.server";

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("order", { ascending: true });

  if (error) throw error;
  return { items: (data || []).map(mapCategory) };
});
