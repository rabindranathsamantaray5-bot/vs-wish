# Plan: Batch 1 - Admin Content & Management Migration

Audit and migrate six Admin pages from the original WishFly repository.

## Source Audit Results
Based on a deep audit of the original `wishfly` repository (`src/routes/admin`), the following implementation status was discovered:

1.  **`/admin/advertisements`**: **Not Present**. Not found in `src/routes/admin`.
2.  **`/admin/plans`**: **Not Present**. Not found in `src/routes/admin`. (Dashboard references "Premium Plan" as a stat, but no dedicated management route exists).
3.  **`/admin/coupons`**: **Not Present**. Not found in `src/routes/admin`.
4.  **`/admin/notifications`**: **Not Present**. Not found in `src/routes/admin`.
5.  **`/admin/comments`**: **Not Present**. Not found in `src/routes/admin`. (Note: Customer-facing comment logic exists in `/wish/$id.jsx` and `src/lib/wish.functions.ts`, and the Dashboard links to `/admin/comments`, but the admin route itself is missing).
6.  **`/admin/guest-book`**: **Not Present**. Not found in `src/routes/admin`.

## Migration Approach
The original repository appears to have established these routes in the `Sidebar.tsx` navigation, but did not implement the actual page files yet. However, the existing `/admin/music` and `/admin/media` migrations set a precedent for using the `PlaceholderPage` pattern for roadmap features.

Following the **STRICT SOURCE-OF-TRUTH RULE**, since these files do not exist in the source, I will:
- **Preserve the status**: Since the user explicitly requested to migrate them, and the original source only defines them as roadmap items in the Sidebar, I will implement them as roadmap/placeholder pages using the established project pattern, ensuring the **Breadcrumbs** and **Navigation** state matches the original layout.

## Implementation Details

### 1. Routes Creation
Create the following route files in `src/routes/admin/`:
- `advertisements.jsx` (Icon: `Megaphone`)
- `plans.jsx` (Icon: `Crown`)
- `coupons.jsx` (Icon: `TicketPercent`)
- `notifications.jsx` (Icon: `Bell`)
- `comments.jsx` (Icon: `MessageSquare`)
- `guest-book.jsx` (Icon: `BookHeart`)

### 2. Breadcrumb & Title Metadata
Update `TITLES` in `src/routes/admin/route.jsx` to match the Sidebar labels:
- `/admin/advertisements`: Advertisements
- `/admin/plans`: Premium Plans
- `/admin/coupons`: Coupons
- `/admin/notifications`: Notifications
- `/admin/comments`: Comments
- `/admin/guest-book`: Guest Book

### 3. Verification
- Confirm all 6 new routes load correctly.
- Verify 1:1 visual parity with the established `PlaceholderPage` animation and layout.
- Perform regression checks on all previously frozen customer and admin pages.

**Report Summary**: All requested pages were found to be missing from the original source repository's route folder, despite being linked in the Sidebar. They will be migrated as Roadmap/Placeholder pages to maintain consistency with the existing project structure and the "Music Library" precedent.
