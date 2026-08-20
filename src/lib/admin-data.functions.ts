import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  listAdminMedia,
  createAdminMedia,
  updateAdminMedia,
  deleteAdminMedia,
  AdminUserDoc,
  AdminMediaDoc,
} from "./admin-data.server";
import { verifyAdminRole } from "./admin-auth.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Server-side verification helper for admin role
const verifyAdmin = async () => {
  await verifyAdminRole();
};

/**
 * ADMIN USERS
 */

export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return listAdminUsers();
  });

export const postAdminUser = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        email: z.string().email(),
        name: z.string().optional(),
        password: z.string().min(8),
        role: z.enum(["admin", "user"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    return createAdminUser(data as Partial<AdminUserDoc>);
  });

export const patchAdminUser = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        role: z.enum(["admin", "user"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { id, ...rest } = data;
    return updateAdminUser(id, rest as Partial<AdminUserDoc>);
  });

export const removeAdminUser = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    return deleteAdminUser(data.id);
  });

/**
 * ADMIN MEDIA
 */

export const getAdminMedia = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    await verifyAdmin();
    return listAdminMedia();
  });

export const postAdminMedia = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        title: z.string().optional(),
        url: z.string().url(),
        type: z.enum(["image", "video", "gif", "sticker", "icon"]).optional(),
        tags: z.string().optional(),
        attribution: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    return createAdminMedia(data as Partial<AdminMediaDoc>);
  });

export const patchAdminMedia = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        id: z.string(),
        title: z.string().optional(),
        url: z.string().url().optional(),
        type: z.enum(["image", "video", "gif", "sticker", "icon"]).optional(),
        tags: z.string().optional(),
        attribution: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await verifyAdmin();
    const { id, ...rest } = data;
    return updateAdminMedia(id, rest as Partial<AdminMediaDoc>);
  });

export const removeAdminMedia = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdmin();
    return deleteAdminMedia(data.id);
  });
