# Jana's Boutique

Online boutique storefront and admin dashboard built with **Next.js 15 (Pages Router)**, **TypeScript**, **Tailwind CSS v4** and **Supabase** (Postgres database + Storage for product photos).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a project at [supabase.com](https://supabase.com/dashboard), then open **SQL Editor → New query**, paste the contents of [`supabase/migrations/20261025000000_init.sql`](supabase/migrations/20261025000000_init.sql) and click **Run**. This creates the tables, the checkout/stats functions and the `product-images` storage bucket.

3. Copy `.env.example` to `.env` and fill it in. `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are under **Project Settings → API Keys** (use the *secret* key, or the legacy `service_role` key). Generate `SESSION_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Add the sample products (optional):

   ```bash
   npm run db:seed
   ```

5. Start the app at [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

   Sign in as admin at `/adminlogin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. That is the only admin account; it is created automatically on first login, and to change it you edit `.env` and restart the server.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `typecheck` / `lint` | `tsc --noEmit` / `next lint` |
| `db:seed` | Add sample products if there are none |

Browse and edit data in the Supabase dashboard's **Table Editor**; uploaded photos are under **Storage → product-images**.

## Schema changes

Add a new file in `supabase/migrations/` named `<YYYYMMDDHHMMSS>_<change>.sql` and run it in the SQL Editor (or with `npx supabase db push` if you use the Supabase CLI). Never edit a migration that has already been run. Then update `types/supabase.ts` to match.

## Email

Order receipts and password-reset links are sent through Gmail using `GMAIL_USER` and a Gmail [app password](https://support.google.com/accounts/answer/185833) in `GMAIL_PASS`. If these aren't set, checkout still works (the receipt is skipped and logged), but "forgot password" returns an error.

See [`../AGENTS.md`](../AGENTS.md) for architecture notes and conventions.
