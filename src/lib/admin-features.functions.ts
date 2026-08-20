import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyAdminRole } from "./admin-auth.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import * as server from "./admin-features.server";

const verifyAdmin = async () => {
  await verifyAdminRole();
};

/**
 * PLANS
 */
export const getAdminPlans = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return server.listAdminPlans();
  });

export const postAdminPlan = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.number(),
        currency: z.string().default("INR"),
        billing_period: z.string().default("monthly"),
        is_active: z.boolean().default(true),
        is_visible: z.boolean().default(true),
        display_order: z.number().default(0),
        features: z.array(z.string()).default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.createAdminPlan(data);
  });

export const patchAdminPlan = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        id: z.string(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        currency: z.string().optional(),
        billing_period: z.string().optional(),
        is_active: z.boolean().optional(),
        is_visible: z.boolean().optional(),
        display_order: z.number().optional(),
        features: z.array(z.string()).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { id, ...rest } = data;
    return server.updateAdminPlan(id, rest);
  });

export const removeAdminPlan = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.deleteAdminPlan(data.id);
  });

/**
 * COUPONS
 */
export const getAdminCoupons = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return server.listAdminCoupons();
  });

export const postAdminCoupon = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        code: z.string(),
        description: z.string().optional(),
        discount_type: z.enum(["percentage", "fixed"]),
        discount_value: z.number(),
        minimum_amount: z.number().default(0),
        maximum_discount: z.number().nullable().optional(),
        starts_at: z
          .string()
          .nullable()
          .optional()
          .transform((value) => value || null),
        expires_at: z
          .string()
          .nullable()
          .optional()
          .transform((value) => value || null),
        usage_limit: z.number().nullable().optional(),
        per_user_limit: z.number().default(1),
        is_active: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.createAdminCoupon(data);
  });

export const patchAdminCoupon = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        id: z.string(),
        code: z.string().optional(),
        description: z.string().optional(),
        discount_type: z.enum(["percentage", "fixed"]).optional(),
        discount_value: z.number().optional(),
        minimum_amount: z.number().optional(),
        maximum_discount: z.number().nullable().optional(),
        starts_at: z
          .string()
          .nullable()
          .optional()
          .transform((value) => value || null),
        expires_at: z
          .string()
          .nullable()
          .optional()
          .transform((value) => value || null),
        usage_limit: z.number().nullable().optional(),
        per_user_limit: z.number().optional(),
        is_active: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { id, ...rest } = data;
    return server.updateAdminCoupon(id, rest);
  });

export const removeAdminCoupon = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.deleteAdminCoupon(data.id);
  });

/**
 * COMMENTS
 */
export const getAdminComments = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return server.listAdminComments();
  });

export const patchAdminComment = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        id: z.string(),
        moderation_status: z.enum(["pending", "approved", "rejected"]).optional(),
        is_spam: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { id, ...rest } = data;
    return server.updateAdminComment(id, rest);
  });

export const removeAdminComment = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.deleteAdminComment(data.id);
  });

/**
 * SETTINGS
 */
export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ type: z.enum(["website", "system", "ai"]) }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    const validatedData = data as { type: "website" | "system" | "ai" };
    return server.getAdminSettings(validatedData.type);
  });

export const postAdminSettings = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        type: z.enum(["website", "system", "ai"]),
        key: z.string(),
        value: z.any(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    return server.updateAdminSettings(data.type, data.key, data.value);
  });

export const getAdminDashboardStats = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return server.getAdminDashboardStats();
  });
