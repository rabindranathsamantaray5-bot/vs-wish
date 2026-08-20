# WishFly Remediation Report

> The later module-by-module Admin audit issues and Razorpay Test Mode template checkout are now fixed. See `ADMIN_CONNECTION_AUDIT.md` and `RAZORPAY_TEST_SETUP.md`.

Updated: Aug 20, 2026

## Verified result

- `npm run lint`: pass (0 errors)
- `npm run typecheck`: pass (0 errors)
- `npm run build`: pass
- E2E suites: 13/13 pass across core, Razorpay and 320/375/430px responsive coverage
- Category integration verified end to end: admin create/update -> homepage name/icon/background/order/visibility
- Automated Razorpay test artifacts restored: 0 E2E users and 0 E2E-owned purchases; real-user pending Orders are preserved.
- Post-test category artifacts restored: 0 E2E categories and 0 E2E users/wishes
- `npm audit`: 0 known vulnerabilities

## Fixed

- Supabase bearer sessions now reach customer APIs and authenticated server functions.
- Customer login/account redirect, profile updates, password verification, wishes, purchases, and template access use the real session.
- Wish creation uses the correct server-function contract and requires an authenticated owner.
- Protected wishes expose only safe metadata before unlock. Password hashes and private content never enter the public DTO.
- Password unlock uses bcrypt plus a signed, expiring token for protected comments.
- Public/protected comments, view API, friendly slugs, and wish-photo rollback are functional.
- Fake paid purchases were removed. Paid template CTAs now use server-created Razorpay Orders when the provider is configured.
- Local message and cover generation endpoints replace missing 404 endpoints; voice preview uses browser speech synthesis.
- Admin users no longer depend on a missing PostgREST relationship. Roles are queried separately and role changes replace old roles.
- Admin-created users require a temporary password and do not depend on email invitation rate limits.
- Legacy random admin statistics were replaced by database statistics.
- Homepage categories now use the real `/api/public/categories` Supabase feed instead of a broken endpoint and hardcoded fallback.
- Admin category name, emoji/image, gradient, display order, and active/hidden state now render on the homepage; responses bypass stale browser caches.
- Customer-facing template cards no longer expose the development-only Supabase fields overlay.
- Hardcoded demo admin credentials and the homepage admin shortcut were removed from the public UI.
- Signup confirmation/rate-limit UX, hydration-safe login forms, mobile overflow, and 404 handling were fixed.
- Unsupported Coming Soon admin routes were removed from the product surface.
- Broken unused UI primitives and mock/fake auth implementations were removed.
- `.env.example`, Playwright E2E coverage, typecheck/test scripts, and formatting/lint cleanup were added.
- Admin Template Save and Comment moderation now send bearer authorization and persist correctly.
- Explicit discount/customer price `0` is free, disables premium, and grants direct frontend access; non-zero customer price is the payable amount.
- Template categories, title, cover, pages, labels, pricing, premium, order and visibility are editable and publicly connected.
- Admin Create User retains and validates the temporary password.
- Website branding, tagline, support contact and SEO metadata now come from Website Settings.
- Registration, public comments and maintenance mode are enforced from System Settings.
- Premium Plans render on `/pricing`; coupons have server-side validation and customer price quotes.
- External media URLs work, and Media Library assets are selectable in Template Editor and Wish Builder.
- Razorpay Test Mode template checkout creates the order server-side, binds it to the authenticated user/template/purchase, verifies the HMAC callback against the server-stored Order ID, confirms captured/paid state from Razorpay, and only then grants access.
- Signed `payment.captured` webhooks reconcile interrupted browser checkouts, while guarded purchase state transitions prevent repeated completion/coupon increments. Failed attempts never unlock access and leave the Order retryable.
- Checkout uses the current Website Settings site name and never exposes the Razorpay key secret or webhook secret to the browser.
- Homepage mobile cards no longer overlap: Trending uses a readable snap-scroll rail below 640px and returns to the responsive grid on larger screens.
- Mobile categories, benefit cards, stats, CTA form, shared header branding and hero height now adapt at narrow 320/375/430px widths without document-level horizontal overflow.

## External configuration still required

- Razorpay Test Mode is configured locally. For deployed webhook recovery, add the public HTTPS `/api/payments/razorpay/webhook` URL and matching secret in the Razorpay Test Dashboard and enable automatic capture.
- Live sales still require Razorpay account activation/KYC, Live Mode keys, a fresh Live webhook secret, HTTPS deployment and a final real low-value payment/refund test.
- Premium-plan subscription checkout remains separate until a plan entitlement/subscription schema is added; the implemented flow is one-time paid template ownership.
- Production signup email reliability/rate limits require Supabase Auth custom SMTP and rate-limit configuration. The application now reports this condition clearly.
