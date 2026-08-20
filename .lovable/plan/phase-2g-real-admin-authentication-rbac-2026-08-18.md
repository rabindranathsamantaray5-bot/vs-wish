# Phase 2G: Real Admin Authentication & RBAC

Migrate Admin authentication from mock session (`wf_admin`) to real Supabase Auth with RBAC verification.

## User Review Required

> [!IMPORTANT]
> Admin users must have the `admin` role assigned in the `public.user_roles` table to access the admin panel. Ensure at least one user is assigned this role before testing.

- **Security**: The `admin` role is verified server-side using the `has_role()` security-definer function.
- **Visuals**: No changes to the glassmorphism UI, gradients, or typography.

## Proposed Changes

### Database & Security
- **RLS Policies**: Ensure all `admin` access policies in the `public` schema use `has_role(auth.uid(), 'admin')`.
- **RBAC**: Verify `public.user_roles` structure matches the implementation requirements.

### Server-Side logic
- **Auth Middleware**: Update `verifyAdmin` in `src/lib/admin-data.functions.ts` to use real Supabase session and role check.
- **Server Functions**: Update all admin-related server functions to use the new authentication verification.
- **API Routes**: Update `/api/admin/me`, `/api/admin/login`, and `/api/admin/stats` to use real Supabase Auth.

### Frontend Integration
- **Admin Layout**: Replace mock `wf_admin` session check in `src/routes/admin/route.jsx` with real Supabase Auth status and role verification.
- **Login Page**: Update `src/routes/admin/login.jsx` to use `supabase.auth.signInWithPassword`.
- **Logout Logic**: Update logout functionality to use `supabase.auth.signOut`.
- **Session Persistence**: Ensure TanStack Start hydration preserves the admin session across refreshes.

### Cleanup
- Remove `wf_admin` cookie and localStorage mock references.
- Remove obsolete mock API handlers in `src/routes/api/admin/login.ts`.

## Technical Details
- **Role Check**: `const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').single();`
- **Session Verification**: Use `.middleware([requireSupabaseAuth])` on server functions, followed by a role check.
- **Route Guard**: Implement a shared layout guard in `src/routes/admin/route.jsx`.

## Verification Plan
1. **Valid Admin**: Login with real account + admin role -> Access granted.
2. **Unauthorized**: Login with valid account + no admin role -> Access denied (redirect or 403).
3. **Anonymous**: Access `/admin` -> Redirect to `/admin/login`.
4. **Persistence**: Refresh page while logged in -> Session persists.
5. **Security**: Attempt to call admin server functions without session/role -> 401/403.
