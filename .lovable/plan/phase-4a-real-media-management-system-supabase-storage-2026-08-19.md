# Phase 4A — Real Media Management System + Supabase Storage

Build a complete production-style Media Library with real file uploads, Supabase Storage, and secure Admin management.

## 1. Backend Infrastructure

- [ ] Create a new Supabase migration for:
    - [ ] `media-library` Storage bucket.
    - [ ] Storage RLS policies for `media-library` (Admin: full, Public: read-only where appropriate).
    - [ ] Add metadata columns to `public.media_library`: `storage_path`, `file_size`, `mime_type`.
- [ ] Add `src/lib/media.server.ts` for privileged storage operations (upload, delete, validation).
- [ ] Add `src/lib/media.functions.ts` for TanStack server functions.

## 2. API Extensions

- [ ] Extend `/api/admin/media` to handle `multipart/form-data` (or JSON with Base64 if preferred, but multipart is better for files).
- [ ] Add `POST /api/admin/media/upload` for file uploads.
- [ ] Update `DELETE /api/admin/media/:id` to cleanup Supabase Storage.
- [ ] Implement atomic failure handling (cleanup Storage if DB insert fails).

## 3. Frontend Implementation

- [ ] Modify `src/routes/admin/media.jsx` to support real file uploads.
- [ ] Update `ResourceManager` or create a specialized `MediaUpload` component for the admin library.
- [ ] Add progress indicators and validation (MIME type, size limits).
- [ ] Implement media preview for both external and Storage-hosted assets.
- [ ] Support metadata editing and search/filtering against the new schema.

## 4. Security & Validation

- [ ] Enforce server-side file validation (size, MIME type).
- [ ] Verify Admin RBAC (`verifyAdminRole`) for all write/delete operations.
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side.

## 5. Verification & Testing

- [ ] End-to-end browser test: Upload -> Verify UI -> Refresh -> Delete.
- [ ] Verify orphan file protection (competing storage/DB failures).
- [ ] Security test: Attempt unauthorized upload/delete as guest or customer.
- [ ] Build verification (`bun run build`).
