import { createServerFn } from "@tanstack/react-start";
import { getPublicClient, mapTemplate, loadCategoryMaps } from "./catalog.server";
import { z } from "zod";

const templateQuerySchema = z.object({
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(10),
});

type TemplateQueryInput = z.infer<typeof templateQuerySchema>;

export const getTemplates = createServerFn({ method: "GET" })
  .validator((data: unknown) => templateQuerySchema.parse(data || {}))
  .handler(async ({ data }) => {
    const { offset, limit } = data as TemplateQueryInput;
    const supabase = getPublicClient();
    const maps = await loadCategoryMaps(supabase as any);

    const { data: rows, error } = await supabase
      .from("templates")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error) throw error;

    const hasMore = (rows?.length || 0) > limit;
    const items = (rows || []).slice(0, limit).map((row) => mapTemplate(row, maps.byId));

    return {
      items,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    };
  });
