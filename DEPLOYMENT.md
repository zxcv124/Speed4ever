# Speed4Ever Deployment

## Runtime

Speed4Ever now uses a free managed backend stack:

- Supabase Auth for email OTP login and sessions
- Supabase Postgres for auctions, bids, blogs, comments, users, and notifications
- Supabase Storage for uploaded images
- Vercel static hosting plus Vercel Functions for bid/finalization API endpoints

## Supabase Setup

Create a free Supabase project, then run the SQL in:

```text
supabase/schema.sql
```

This creates the database tables, RLS policies, and public image bucket.

## Vercel Environment Variables

Set these in Vercel production:

```text
REACT_APP_SUPABASE_URL=<your Supabase project URL>
REACT_APP_SUPABASE_ANON_KEY=<your Supabase anon publishable key>
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
REACT_APP_SUPABASE_STORAGE_BUCKET=speed4ever-images
REACT_APP_ENABLE_GUEST_ACCESS=true
CRON_SECRET=<random secret for external/manual cron calls, optional for Vercel Cron>
```

Only `REACT_APP_*` values are exposed to the browser. `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only.

Guest access uses Supabase anonymous sign-ins. Enable anonymous sign-ins in the Supabase Auth settings while the temporary guest tester is active. Set `REACT_APP_ENABLE_GUEST_ACCESS=false` and redeploy to hide the guest button.

After changing environment variables:

```sh
vercel deploy --prod
```

Auction finalization runs through `/api/finalize-expired-auctions`. Vercel Hobby supports daily cron jobs, so the included `vercel.json` schedule closes expired auctions once per day.

## Removed Services

The previous managed auth, database, storage, admin SDK, and cloud-function stack has been removed from the app.

SendGrid is not used by the production app path.

## Verification

Run the full local verification suite before deployment:

```sh
npm run test:all
CI=true npm run build
npx vercel build --prod
```
