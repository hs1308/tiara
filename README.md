# Tiara

Tiara is a community-led beauty commerce prototype built for a PM interview assignment. The experience is mobile-first, responsive on desktop, and designed around one core product thesis: beauty discovery, trust, and purchase should happen in one connected flow instead of across fragmented apps.

## What is in the prototype

- Home with curated community + commerce storytelling
- Reddit-like feed with thread views and comments
- Shop PLP and product PDP
- Cart, wallet, checkout, and success flows
- Create post flow that closes the purchase-to-community loop
- Supabase-ready schema and seed SQL under [supabase/tiara_schema.sql](/D:/Tiara/repo/supabase/tiara_schema.sql)

## Stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Supabase JS

## Local setup

1. Install dependencies with `npm install`
2. Add env values in `.env.local`
3. Run `npm run dev`
4. Open `http://127.0.0.1:4175` if using the standard local port

## Data model

The repo includes a Supabase schema with seeded demo content for:

- `tiara_users`
- `tiara_products`
- `tiara_posts`
- `tiara_comments`
- `tiara_cart_items`
- `tiara_orders`

If those tables are not yet created in Supabase, the app falls back to local seeded browser storage so the demo remains fully navigable.
