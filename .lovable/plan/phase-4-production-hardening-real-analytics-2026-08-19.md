# Phase 4: Production Hardening & Real Analytics

Establish a production-ready application by replacing all remaining mock data, implementing real AI generation, securing the view counter with a database RPC, and optimizing performance and UI.

## Phase 1: Real Admin Dashboard Analytics
- **Aggregation Logic:** Create `getAdminDashboardStats` server function to aggregate real data from `profiles`, `wishes`, `templates`, `categories`, and `purchases`.
- **Time-series Data:** Calculate daily wish creation and views over the last 30 days using real timestamps.
- **Revenue:** Calculate actual revenue from `purchases` where status is 'claimed' or 'completed'.
- **Top Templates:** Use SQL aggregation to find the most used templates by wish count.

## Phase 2: Atomic Wish View Counter
- **Database RPC:** Create `increment_wish_view(wish_id)` PostgreSQL function to atomically increment `wishes.views_count`.
- **Security:** Ensure the RPC is server-controlled and cannot be manipulated by the browser (no arbitrary increments).

## Phase 3: Performance & N+1 Query Fixes
- **Batching:** Replace individual queries in Admin Template and User lists with batch fetches and mapping.
- **Relational Selects:** Use Supabase's `select('*, table(column)')` to fetch related data in a single request.

## Phase 4: Real AI Generation
- **Integration:** Implement the `Generate Message` functionality in the Wish Builder using the project's AI Gateway.
- **Security:** Ensure all AI calls happen server-side; fetch configuration from `ai_settings`.

## Phase 5: Real Media Management & Optimization
- **Upload Progress:** Enhance `ResourceManager` with real-time upload progress for the `media-library` Supabase bucket.
- **Image Strategy:** Implement lazy loading and responsive sizing for category icons and template previews.

## Phase 6: UI/UX Refinement
- **Mobile Dashboard:** Fix layout shifts and overflow issues on Admin Dashboard charts for mobile viewports.
- **Account CTA:** Replace the generic empty state on `/account/purchases` with a "Browse Templates" CTA.

## Technical Details
- **Tables:** `profiles`, `wishes`, `purchases`, `templates`, `categories`, `media_library`, `ai_settings`.
- **Auth:** `verifyAdminRole()` for all analytics and administrative operations.
- **Tools:** `supabase--migration` for the view counter RPC.
- **Regression:** Verify zero plaintext passwords and existing RBAC remain intact.
