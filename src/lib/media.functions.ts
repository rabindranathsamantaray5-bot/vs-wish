import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { verifyAdminRole } from "./admin-auth.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import {
  validateFile,
  generateStoragePath,
  uploadToStorage,
  deleteFromStorage,
  STORAGE_BUCKET,
} from "./media.server";
import { createAdminMedia, deleteAdminMedia, AdminMediaDoc } from "./admin-data.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server function to handle media upload.
 * Receives FormData with file and metadata.
 */
export const uploadAdminMedia = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    const request = getRequest()!;
    await verifyAdminRole();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || file.name;
    const type = (formData.get("type") as any) || "image";
    const tags = (formData.get("tags") as string) || "";
    const attribution = (formData.get("attribution") as string) || "";

    if (!file) throw new Error("No file uploaded");

    // 1. Server-side validation
    validateFile(file, type);

    // 2. Prepare Storage path
    const storagePath = generateStoragePath(file.name);
    const mimeType = file.type;

    let storageResult;
    try {
      // 3. Upload to Storage
      const buffer = Buffer.from(await file.arrayBuffer());
      storageResult = await uploadToStorage(storagePath, buffer, mimeType);

      // Get public URL or signed URL depending on visibility
      // Since bucket is private by default now (due to workspace policy), use getPublicUrl if we can, or just store path.
      // But we need a URL for the 'url' field in media_library.
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

      // 4. Create DB record
      const mediaRecord = await createAdminMedia({
        title,
        url: publicUrl,
        type,
        tags,
        attribution,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: mimeType,
      });

      return mediaRecord;
    } catch (error: any) {
      // ATOMIC FAILURE HANDLING: Cleanup storage if DB fails
      if (storageResult) {
        await deleteFromStorage(storagePath);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }
  });

export const removeAdminMediaWithStorage = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await verifyAdminRole();

    // 1. Get the record to find storage path
    const { data: media, error } = await supabaseAdmin
      .from("media_library")
      .select("storage_path")
      .eq("id", data.id)
      .single();

    if (error) throw new Error(`Media not found: ${error.message}`);

    // 2. Delete from DB
    await deleteAdminMedia(data.id);

    // 3. Delete from Storage if it exists
    if (media.storage_path) {
      await deleteFromStorage(media.storage_path);
    }

    return { success: true };
  });
