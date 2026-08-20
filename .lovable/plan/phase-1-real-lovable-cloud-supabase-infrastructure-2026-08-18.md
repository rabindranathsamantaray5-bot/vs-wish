# Phase 1: Real Lovable Cloud (Supabase) Infrastructure

Establish the core backend foundation using Lovable Cloud (Supabase) and implement the initial schema and security model without modifying existing application logic or UI.

## Infrastructure Task List

- [ ] **Supabase Connection**: Ensure the project is connected to Lovable Cloud and environment variables are properly scoped.
- [ ] **Database Schema**: Create core tables with UUIDs, foreign keys, and indexes via migrations.
- [ ] **Security (RLS & Admin Roles)**:
    - Implement `app_role` enum and `user_roles` table.
    - Create a secure `has_role` function using `SECURITY DEFINER` to avoid recursion.
    - Enable RLS and define strict policies (no public write access on sensitive tables).
- [ ] **Auth Foundation**:
    - Create `profiles` table.
    - Implement a trigger to automatically create a profile entry when a new user signs up via Supabase Auth.
- [ ] **Data Seeding**:
    - Migrate existing mock categories and templates from `src/lib/admin-categories.store.ts` and `src/lib/admin-templates.store.ts` into PostgreSQL tables.
- [ ] **Verification**:
    - Validate table structure, constraints, and RLS policies.
    - Verify that `SUPABASE_SERVICE_ROLE_KEY` is strictly server-only and not leaked to the browser.
    - Ensure all existing frozen pages and mock APIs continue to function without interruption.

## Technical Implementation Details

### Database Schema
Tables to be created:
1. `profiles`: `id (uuid, pk)`, `name (text)`, `created_at`, `updated_at`.
2. `user_roles`: `id (uuid, pk)`, `user_id (uuid, fk)`, `role (app_role enum)`.
3. `categories`: `id (uuid, pk)`, `name (text)`, `img (text)`, `bg (text)`, `order (int)`, `active (bool)`, `created_at`, `updated_at`.
4. `templates`: `id (uuid, pk)`, `title (text)`, `category_id (uuid, fk)`, `pages (int)`, `badge (text)`, `label (text)`, `sub (text)`, `photo (text)`, `price (numeric)`, `discount_price (numeric)`, `is_premium (bool)`, `order (int)`, `active (bool)`, `created_at`, `updated_at`.
5. `wishes`: `id (uuid, pk)`, `slug (text, unique)`, `template_id (uuid, fk)`, `user_id (uuid, fk)`, `title (text)`, `recipient (text)`, `from_name (text)`, `message (text)`, `details (text)`, `theme (text)`, `cover_url (text)`, `music_url (text)`, `video_url (text)`, `event_date (timestamptz)`, `password_hash (text)`, `views (int)`, `created_at`, `updated_at`.
6. `wish_photos`: `id (uuid, pk)`, `wish_id (uuid, fk)`, `url (text)`, `order (int)`, `created_at`.
7. `media_library`: `id (uuid, pk)`, `title (text)`, `url (text)`, `type (text)`, `tags (text)`, `attribution (text)`, `created_at`.
8. `comments`: `id (uuid, pk)`, `wish_id (uuid, fk)`, `user_id (uuid, fk, optional)`, `name (text)`, `message (text)`, `reaction (text)`, `created_at`.
9. `purchases`: `id (uuid, pk)`, `user_id (uuid, fk)`, `template_id (uuid, fk)`, `amount (numeric)`, `status (text)`, `created_at`.

### Security Implementation
- **has_role**: A `security definer` function to check role membership without recursive RLS issues.
- **Service Role**: Handled strictly within TanStack Start `server` handlers or server functions; never imported into components.
- **RLS Policies**:
    - `profiles`: Users can read/update their own profile.
    - `categories`/`templates`: Publicly readable, admin-only write.
    - `wishes`: Readable by owner or by slug (if no password). `password_hash` column included but logic not yet implemented.
    - `user_roles`: Read-only for authenticated users (via `has_role`), admin-only write.

### Migration Logic
- The existing mock stores in `src/lib/*.store.ts` will remain the source of truth for the frontend during this phase.
- PostgreSQL tables will be populated to match the mock state, ensuring a clean baseline for Phase 2.

## Verification Plan
1. **Migration Verification**: Check `supabase--migration` status.
2. **Security Audit**: Verify no public write access on sensitive tables via `read_query`.
3. **Environment Check**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is not present in `import.meta.env` accessible to the client.
4. **Regression Testing**: Load all 29+ frozen routes and verify they still use the existing mock data correctly.

## Constraints
- **NO UI changes**.
- **NO replacement of mock stores/APIs** in this phase.
- **NO storage upload migration**.
- **STOP and report** after infrastructure is verified.

