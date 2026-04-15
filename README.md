# Changa mobile app design

This is a code bundle for Changa mobile app design. The original project is available at https://www.figma.com/design/mOeFw661DR382ufJThUfbS/Changa-mobile-app-design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Supabase setup

1. Copy `.env.example` to `.env`.
2. In your Supabase project dashboard, go to **Project Settings → API** and copy:
   - `Project URL` into `VITE_SUPABASE_URL`
   - `anon public` key into `VITE_SUPABASE_ANON_KEY`
3. Open the Supabase SQL editor and run `supabase-schema.sql`.

### Security note

- Never put the **service_role** key in frontend code.
- This app only uses the **anon** key in Vite env vars.
