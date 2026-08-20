# Plan: Real Admin Features Implementation

Establish real production functionality for Premium Plans, Coupons, Comments, Website Settings, System Settings, and AI Management.

## Phase 1: Database Foundation
Create new tables and extend existing ones with proper RLS and Admin RBAC.

### 1.1 Migrations
- **public.plans**: Tier name, slug, pricing, billing, JSONB features.
- **public.coupons**: Unique codes, discount types, usage limits, expiry.
- **public.website_settings**: Site identity, support info, SEO defaults.
- **public.system_settings**: Feature flags (registration, comments), limits.
- **public.ai_settings**: Configuration for providers and models (no secret keys).
- **public.comments extension**: Add `moderation_status`, `is_spam`.

### 1.2 Security
- Enable RLS on all new tables.
- Grant access to `authenticated` and `service_role`.
- Create policies using `public.has_role(auth.uid(), 'admin')` for all write operations.
- Restrict sensitive settings read access where appropriate.

## Phase 2: Backend Logic & API
Implement server-side logic and API endpoints using TanStack Start patterns.

### 2.1 Server Modules
- `src/lib/admin-plans.server.ts` & `functions.ts`
- `src/lib/admin-coupons.server.ts` & `functions.ts`
- `src/lib/admin-settings.server.ts` & `functions.ts`
- `src/lib/admin-comments.server.ts` & `functions.ts`

### 2.2 API Routes
- `/api/admin/plans` (GET, POST, PATCH, DELETE)
- `/api/admin/coupons` (GET, POST, PATCH, DELETE)
- `/api/admin/comments` (GET, PATCH, DELETE)
- `/api/admin/settings/website` (GET, POST)
- `/api/admin/settings/system` (GET, POST)
- `/api/admin/settings/ai` (GET, POST)

## Phase 3: Admin UI Implementation
Replace placeholders with real `ResourceManager` and custom settings forms.

### 3.1 Views
- **/admin/plans**: CRUD for tiers.
- **/admin/coupons**: CRUD for discount codes.
- **/admin/comments**: Moderation list with filters.
- **/admin/settings/* **: Unified settings forms with toggle, selects, and saving states.

## Phase 4: Customer-Side Integration
Connect the real data to the customer-facing application.
- pricing UI pulls from `public.plans`.
- Comment display filters by `moderation_status`.
- Website title/logo updates from `public.website_settings`.
- Feature availability gates based on `public.system_settings`.

## Verification
- Browser testing of all Admin CRUD flows.
- RLS verification (non-admins must be denied).
- `bun run build` check.
