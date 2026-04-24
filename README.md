<!--
WHY: Replace the legacy design-export README with product and architecture documentation for the real app.
CHANGED: YYYY-MM-DD
-->

# Changa

## What this is

Changa is a React 18 + Vite SPA with direct Supabase access using a BaaS model.
Auth, data access, and row-level security are currently managed through Supabase.
Business logic that should be server-side will incrementally move to Supabase Edge Functions.

## Architecture

- Browser: React 18 / Vite 6 / react-router
- Data: Supabase Postgres accessed directly from the browser via `@supabase/supabase-js`
- Auth: Supabase Auth
- Hosting: Vercel static deployment
- Server-side boundary: Supabase Edge Functions, incrementally introduced for sensitive and transactional flows

## Local setup

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Fill in the Supabase environment variables from your Supabase project dashboard.
4. Install dependencies with `npm install`.
5. Run the app locally with `npm run dev`.

If you want the real database-backed experience, run the SQL in `supabase-schema.sql` inside the Supabase SQL editor before using the app.

## Scripts

- `npm run dev`: start the Vite development server
- `npm run build`: create a production build
- `npm run lint`: lint all TypeScript and TSX files under `src`
- `npm run typecheck`: run the TypeScript compiler in no-emit mode
- `npm run format`: format the `src` tree with Prettier
- `npm run test`: run the Vitest test suite once
- `npm run test:e2e`: run Playwright E2E suite
- `npm run test:e2e:headed`: run E2E suite with browser UI
- `npm run test:e2e:smoke`: run smoke subset tagged with `@smoke`
- `npm run test:e2e:auth`: run authentication subset tagged with `@auth`
- `npm run test:watch`: run Vitest in watch mode
- `npm run check`: run typecheck, lint, and tests in sequence

For E2E setup details, see `e2e/README.md`.

## Known architectural limitations (intentional for now)

- Business logic partially lives in the browser, especially in `src/app/hooks/useAppState.tsx`
- No centralized input validation yet; Zod is planned as part of the refactor roadmap
- No test coverage yet; Vitest setup is being introduced incrementally
- Avatar persistence is localStorage-only for now and is tracked for a future DB-backed migration

## Deployment

The app is deployed as a static Vercel site and connects to Supabase at runtime.

Required environment variables:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key

These variables must be set in both local development and Vercel production environments.

## Supabase notes

- Never expose the Supabase `service_role` key in frontend code.
- The current app only uses the anon key in Vite environment variables.
- Production should not rely on fallback mode. Missing Supabase variables in production are treated as a startup error.

## Google Auth setup

Google login is handled through Supabase Auth using `signInWithOAuth`.

Required dashboard setup:

- In Google Auth Platform, create a Web application OAuth client.
- Add the app origin to Authorized JavaScript origins, including local development while needed.
- Add the Supabase Google provider callback URL to Authorized redirect URIs.
- In Supabase Auth -> Providers -> Google, enable Google and paste the Google Client ID and Client Secret.
- In Supabase Auth URL Configuration, allow the app redirect URLs used by the SPA, for example local development and production URLs.

Do not put the Google Client Secret in Vite environment variables or frontend code.
