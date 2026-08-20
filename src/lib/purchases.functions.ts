import { createServerFn } from "@tanstack/react-start";
import {
  fetchUserPurchases,
  checkTemplateAccess,
  getTemplatePriceInfo,
  recordPurchase,
} from "./purchases.server";
import { getAuthenticatedUser } from "./auth.server";
import { z } from "zod";

const templateIdSchema = z.object({
  templateId: z.string(),
});

const optionalTemplateIdSchema = z
  .object({
    templateId: z.string().optional(),
  })
  .optional()
  .default({ templateId: undefined });

const batchTemplateIdsSchema = z
  .object({
    templateIds: z.array(z.string()).optional().default([]),
  })
  .optional()
  .default({ templateIds: [] });

type TemplateIdInput = z.infer<typeof templateIdSchema>;
type OptionalTemplateIdInput = z.infer<typeof optionalTemplateIdSchema>;
type BatchTemplateIdsInput = z.infer<typeof batchTemplateIdsSchema>;

export const getPurchases = createServerFn({ method: "GET" }).handler(async () => {
  const userId = (await getAuthenticatedUser())?.id;

  if (!userId) {
    return { items: [] };
  }

  const items = await fetchUserPurchases(userId);
  return { items };
});

export const getTemplateAccess = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    try {
      return optionalTemplateIdSchema.parse(d || {});
    } catch (e) {
      return { templateId: undefined };
    }
  })
  .handler(async ({ data }) => {
    const templateId = (data as OptionalTemplateIdInput)?.templateId;

    if (!templateId) {
      return { templateId: "", hasAccess: false, priceInfo: null };
    }

    const userId = (await getAuthenticatedUser())?.id || null;

    const [hasAccess, priceInfo] = await Promise.all([
      checkTemplateAccess(userId, templateId),
      getTemplatePriceInfo(templateId),
    ]);

    return {
      templateId,
      hasAccess,
      priceInfo,
    };
  });

export const getBatchTemplateAccess = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    try {
      return batchTemplateIdsSchema.parse(d || {});
    } catch (e) {
      return { templateIds: [] };
    }
  })
  .handler(async ({ data }) => {
    const templateIds = (data as BatchTemplateIdsInput)?.templateIds || [];

    if (templateIds.length === 0) {
      return { results: [] };
    }

    const userId = (await getAuthenticatedUser())?.id || null;

    const results = await Promise.all(
      templateIds.map(async (id) => {
        try {
          const [hasAccess, priceInfo] = await Promise.all([
            checkTemplateAccess(userId, id),
            getTemplatePriceInfo(id),
          ]);
          return { templateId: id, hasAccess, priceInfo };
        } catch (err) {
          console.error(`Error fetching access for template ${id}:`, err);
          return { templateId: id, hasAccess: false, priceInfo: null, error: true };
        }
      }),
    );

    return { results };
  });

export const initiatePurchase = createServerFn({ method: "POST" })
  .validator((d: unknown) => templateIdSchema.parse(d))
  .handler(async ({ data }) => {
    const { templateId } = data as TemplateIdInput;
    const userId = (await getAuthenticatedUser())?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    const priceInfo = await getTemplatePriceInfo(templateId);

    if (priceInfo.isFree) {
      await recordPurchase(userId, templateId, 0);
      return { success: true, message: "Free template unlocked" };
    }

    throw new Error(
      "Secure payments are not configured yet. Configure a verified payment provider before selling paid templates.",
    );
  });
