# WishFly Admin Connection Audit — Fixed

Updated: Aug 20, 2026

## Final result

All issues found in the Admin-to-customer connection audit have been implemented and verified with the configured Supabase project.

| Admin area | Database/Admin behavior | Customer/public behavior | Result |
| --- | --- | --- | --- |
| Users | List, create, edit and delete | Auth/profile/role data | Pass |
| Templates | Dynamic category, editable content/pricing/media, authenticated save | Cards, filters, access and payable price | Pass |
| Categories | CRUD, order and visibility | Homepage and template filters | Pass |
| Media Library | Upload, external URL and delete | Template and Wish Builder pickers | Pass |
| Premium Plans | CRUD and feature arrays | Working `/pricing` route | Pass |
| Coupons | Full rule fields and validation | Quote plus verified Razorpay template payment | Pass* |
| Comments | Authenticated moderation, no invalid CRUD controls | Only approved comments shown | Pass |
| Website Settings | Persisted branding/contact/SEO | Public brand, tagline, support and metadata | Pass |
| System Settings | Persisted feature toggles | Registration, comments and maintenance enforced | Pass |

\* Coupon calculation and one-time paid-template checkout are connected. Premium-plan subscriptions remain separate until entitlement/subscription storage is added.

## Implemented behavior

### Templates and pricing

- Admin list and PATCH requests attach the current Supabase bearer token, fixing the HTTP 401 Save error.
- The category dropdown loads Admin Categories instead of a hardcoded list.
- Title, cover image URL, page count, label, category, order and active state are editable.
- Cover images can be selected directly from Media Library.
- A blank customer price uses the base price; an explicit customer price of `0` makes the template free.
- The customer pays the explicit customer/discount price when present.
- Premium is automatically switched off and cannot be enabled when the payable price is zero.
- Free templates can be used directly without purchase and render as `Free`, not `Purchased`.

### Users and comments

- Admin Create User validation now retains and validates the temporary password (minimum eight characters).
- Comment moderation requests include the bearer token.
- The controlled dropdown value is captured before the async token lookup, preventing the old status from being submitted.
- Comments is moderation-only: Add/Edit/Delete controls are not rendered.

### Website and system settings

- Public settings are exposed through a read-only endpoint and shared provider.
- Site name and tagline apply to public headers, footers, account pages, wish pages, generated covers, FAQs and calls to action.
- Support email and copyright are database-driven.
- Default title/description update document, OpenGraph and Twitter metadata.
- Registration disabled blocks the form and submission.
- Comments disabled blocks public posting in both UI and server logic.
- Maintenance mode replaces public pages with a maintenance screen while Admin remains accessible.

### Plans, coupons and media

- `/pricing` lists active, visible plans in Admin display order and renders the saved feature array.
- Plan features are edited one per line and stored as an array.
- Coupon validation enforces active state, dates, usage limit, minimum amount, type/value and maximum discount.
- Template cards can apply a coupon and show the server-calculated final amount.
- Paid template checkout reloads the authoritative price and coupon on the server, creates a Razorpay Order, and unlocks only after signature plus captured-payment verification.
- External URL media creation now works through the Admin API.
- Media Library assets can be selected in Template Editor and Wish Builder.
- Upload input is create-only because edit does not replace the storage object.

## Verification

- `npm run lint`: pass
- `npm run typecheck`: pass
- `npm run build`: pass
- Core E2E: 8/8 pass
- Razorpay Test API/security E2E: 2/2 pass (real test order, forged checkout rejection and invalid webhook rejection)
- E2E cleanup: zero temporary users, categories, templates, plans, coupons, media records and wishes.
- Original site settings restored after testing.

## External requirements

Razorpay Test Mode one-time template checkout is implemented. A public HTTPS webhook configured with the matching Test secret is still required to exercise asynchronous recovery outside localhost. Live sales additionally require Razorpay activation/KYC, Live keys, a separate Live webhook secret and a final real payment/refund verification. Premium-plan recurring/entitlement checkout is not represented by the current one-time `purchases` schema.
