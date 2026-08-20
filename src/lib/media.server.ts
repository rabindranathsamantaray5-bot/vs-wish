import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface MediaMetadata {
  storagePath: string;
  fileSize: number;
  mimeType: string;
  bucketName: string;
}

export const STORAGE_BUCKET = "media-library";

/**
 * Validates file constraints.
 */
export function validateFile(file: File | Blob, type: string) {
  const size = file.size;
  const mime = file.type;

  // Limits (can be adjusted)
  const limits: Record<string, number> = {
    image: 5 * 1024 * 1024, // 5MB
    gif: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
    sticker: 2 * 1024 * 1024, // 2MB
    icon: 1 * 1024 * 1024, // 1MB
  };

  const limit = limits[type] ?? limits["image"]!;
  if (size > limit) {
    throw new Error(`File too large. Maximum size for ${type} is ${limit / (1024 * 1024)}MB.`);
  }

  // Basic MIME check
  if (type === "image" && !mime.startsWith("image/"))
    throw new Error("Invalid MIME type for image");
  if (type === "video" && !mime.startsWith("video/"))
    throw new Error("Invalid MIME type for video");
  if (type === "gif" && mime !== "image/gif") throw new Error("Invalid MIME type for GIF");

  return true;
}

/**
 * Generates a safe storage path.
 */
export function generateStoragePath(filename: string) {
  const uuid = crypto.randomUUID();
  const sanitized = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
  return `media/${uuid}/${sanitized}`;
}

/**
 * Uploads a file to Supabase Storage using Admin client.
 */
export async function uploadToStorage(path: string, file: Buffer | Blob, mimeType: string) {
  const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw error;
  return data;
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteFromStorage(path: string) {
  const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    console.error("Storage deletion failed for path:", path, error);
    // We don't throw here to avoid blocking DB cleanup if storage is already gone
    return false;
  }
  return true;
}

/**
 * Gets a signed URL for private storage assets.
 */
export async function getSignedUrl(path: string, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
