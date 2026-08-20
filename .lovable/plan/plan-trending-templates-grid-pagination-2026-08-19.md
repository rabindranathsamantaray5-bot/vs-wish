# Plan: Trending Templates Grid & Pagination

Update the Trending Templates section on the Home page from a carousel to a responsive grid with "Load More" pagination, real Supabase data, and dynamic pricing.

## Proposed Changes

### 1. API & Data Layer
- Update `src/lib/templates.functions.ts`:
    - Modify `getTemplates` server function to support pagination (`offset` and `limit`).
    - Return `items` and a `hasMore` flag.
- Update `src/routes/api/public/templates.ts` to match the paginated server function (for consistency, though the Home page uses the server function).

### 2. Frontend: Home Page Section
- Modify `Trending` component in `src/routes/index.jsx`:
    - Remove carousel logic (arrows, horizontal scrolling, snap-x).
    - Implement a responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.
    - Use `useInfiniteQuery` or manual state management to handle "Load More" batches of 10.
    - Add a premium "Load More Templates" button with loading/error states.
    - Center the button below the grid.
    - Hide the button when no more templates are available.
    - Implement an empty state for 0 templates.

### 3. Pricing & Flow Implementation
- Ensure `TemplatePricingCard` (which is already used) correctly handles the updated data.
- Verify FREE templates (price = 0) allow direct use via `onOpenBuilder`.
- Verify PAID templates (price > 0) trigger the purchase flow.
- Ensure discounts are displayed correctly (original price strikethrough, percent off).

### 4. Visual Parity & Responsiveness
- Maintain existing card design (aspect ratio, badges, typography, shadows).
- Test on 1920px (5 cols), 1024px (4/3 cols), and 430px/390px (2 cols).
- Ensure no horizontal scrolling or clipped cards on mobile.

## Technical Details
- **Batch Size:** 10 templates per load.
- **Initial Load:** First 10 templates.
- **Grid Layout:** 5 columns on desktop, 2 columns on mobile.
- **Data Source:** Supabase `templates` table (active=true, ordered by `order`).
- **Dependencies:** `@tanstack/react-start` server functions, `framer-motion` for animations, `lucide-react` for icons.

## Verification Plan
- **E2E Tests:**
    - Verify grid column count at different viewports.
    - Verify "Load More" appends exactly 10 cards (if available).
    - Verify "Load More" disappears when items < batch size.
    - Verify FREE badge for price 0.
    - Verify Purchase flow for price > 0.
    - Verify responsive behavior on mobile (2 columns).
- **Build Check:** Run `bun run build`.
