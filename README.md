# Jana's Boutique

Online boutique storefront and admin dashboard built with **Next.js 15 (Pages Router)**, **TypeScript**, **Tailwind CSS v4** and **PostgreSQL** (via Prisma 7).

## Setup

1. Install dependencies (this also generates the Prisma client):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill it in. For a local database you can run:

   ```bash
   npx prisma dev -n janasboutique --detach
   ```

   It prints a `postgres://…` URL to use as `DATABASE_URL`. Generate `SESSION_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Create the tables and seed the admin account and sample products:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the app at [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

   Sign in as admin at `/adminlogin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `typecheck` / `lint` | `tsc --noEmit` / `next lint` |
| `db:migrate` | Create and apply migrations (development) |
| `db:deploy` | Apply existing migrations (production) |
| `db:seed` | Upsert the admin account and add sample products if there are none |
| `db:studio` | Prisma Studio database browser |

## Email

Order receipts and password-reset links are sent through Gmail using `GMAIL_USER` and a Gmail [app password](https://support.google.com/accounts/answer/185833) in `GMAIL_PASS`. If these aren't set, checkout still works (the receipt is skipped and logged), but "forgot password" returns an error.

See [`../AGENTS.md`](../AGENTS.md) for architecture notes and conventions.
