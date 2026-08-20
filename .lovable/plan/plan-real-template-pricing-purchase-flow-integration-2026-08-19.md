# Plan: Real Template Pricing & Purchase Flow Integration

Migrate template cards and purchase logic from mock/partial state to a fully dynamic, database-driven system with real-time pricing, discounts, and ownership verification.

## User Review Required

> [!IMPORTANT]
> This plan implements the **logic** and **UI state** for purchasing. The actual payment gateway integration (Stripe/Razorpay) will be handled in a subsequent step. For now, "Buy Now" will simulate a successful purchase for testing purposes.

- Should we show the "X% OFF" badge only if the discount is greater than a certain threshold (e.g., 5%)?
- For "FREE" templates, should we still record a "purchase" in the database for tracking purposes, or just allow access?

## Proposed Changes

### Backend (Supabase & Server Functions)

#### 1. Database Hardening
- Create a migration to ensure `public.purchases` has the correct status enum and indexes.
- Add a unique constraint to prevent double-purchasing the same template.

#### 2. Pricing Logic (`src/lib/purchases.server.ts`)
- Implement `getTemplateFinalPrice(templateId)`: Server-side source of truth for pricing.
- Implement `checkTemplateAccess(userId, templateId)`: Checks if template is free or owned.

#### 3. Purchase Flow (`src/lib/purchases.functions.ts`)
- Create `initiateTemplatePurchase`: Validates template, user, and calculates price.
- Create `verifyTemplateOwnership`: Used by the Wish Builder to gate premium content.

### Frontend (UI & Integration)

#### 1. Dynamic Template Cards (`src/routes/index.jsx` & `src/routes/templates.jsx`)
- Replace mock `DEFAULT_TEMPLATES` with real data fetch.
- Implement `PriceDisplay` component matching 1:1 visual parity:
    - **Free**: Show "FREE" badge, "Use Template" button.
    - **Paid**: Show "₹Price", "Buy Now" button.
    - **Discounted**: Show "₹Discount ₹Original", "X% OFF" badge, "Buy Now" button.
    - **Purchased**: Show "✓ Purchased", "Use Template" button.

#### 2. Wish Builder Access Control
- Intercept the "Create" flow to check if the selected template requires purchase.
- Show a "Purchase Required" overlay if a guest or non-owner tries to use a premium template.

#### 3. Account Purchases Page
- Ensure `/account/purchases` correctly displays the real amount paid and date from the database.

## Technical Details

- **Price Security**: The client sends only `templateId`. The server fetches the template from the DB to determine the price before creating any order.
- **State Management**: Use `useQuery` with `staleTime: 0` for purchase state to ensure immediate UI updates after "buying".
- **Responsive Parity**: All new elements will use Tailwind classes consistent with the existing `TemplateCard` (e.g., `text-[13px]`, `font-display`).

## Success Criteria

- Changing a price in the Admin panel instantly updates the Home page and /templates page.
- Logged-out users see "Buy Now" which triggers the login flow.
- "Buy Now" creates a real record in `public.purchases` and unlocks the "Use Template" button.
- Discount badges only appear when `discount_price < price`.
- Wish Builder blocks usage of premium templates not owned by the user.
