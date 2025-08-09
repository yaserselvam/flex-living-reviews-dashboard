# Flex Living Reviews Dashboard

Manager dashboard and public review pages for Flex Living properties.

## Overview

- Built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **TypeScript**.
- Fetches reviews from Hostaway sandbox via `/api/reviews/hostaway`.
- Falls back to `/mock/reviews.json` if the API returns zero reviews.
- Dashboard includes filters for rating, category, channel, and date, with sorting options.
- Toggle "Show on Website" for reviews via `PATCH /api/reviews/[id]`.
- Public page at `/properties/[listing]` displays only **approved** reviews.
- Optional: Stubbed Google Reviews endpoint (`/api/reviews-google`) for exploration, requires `GOOGLE_API_KEY`.

## Tech Stack and Reasoning

- **Next.js App Router**: Co-locates server route handlers with pages, simplifies Vercel deployment.
- **TypeScript**: Ensures type safety for reviews and normalization, reducing bugs.
- **Tailwind CSS**: Enables fast, consistent, and responsive UI design.
- **date-fns**: Lightweight library for date filtering.
- **zod**: Available for future schema validation if Hostaway API changes.

## Setup

1. Clone the repository and install dependencies:
   ```bash
   pnpm i # or npm i / yarn
   ```

2. Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

3. Configure environment variables in `.env.local`:
   ```
   ACCOUNT_ID=your_hostaway_sandbox_account_id
   API_KEY=your_hostaway_sandbox_api_key
   GOOGLE_API_KEY=your_google_api_key (optional, for Google Reviews exploration)
   ```

4. Run locally:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser.

## API

- **GET /api/reviews/hostaway**  
  Returns normalized JSON:
  ```json
  {
    "listings": { "shoreditch-loft": { "name": "Flex Living - Shoreditch Loft", "slug": "shoreditch-loft" }},
    "reviews": [ ... ]
  }
  ```
  Uses Hostaway API; falls back to `/mock/reviews.json` if no reviews are returned.

- **PATCH /api/reviews/[id]**  
  Body: `{ "approved": true|false }`  
  Updates review approval status.  
  **Persistence**: Uses an in-memory store (resets on cold start), sufficient for the assessment. For production, replace with Vercel KV or Postgres/Supabase by updating `lib/approvalsStore.ts`.

- **GET /api/reviews-google** (optional)  
  Returns `[]` unless `GOOGLE_API_KEY` is configured. Stubbed for exploration.

## Public Pages

- `/properties/[listing]`: Displays a property hero section and only approved reviews.

## Google Reviews Exploration

- **Feasibility**: Requires a Google Place ID and Places Details API (paid, with quotas and review access rules).
- **Privacy**: Comply with Google’s attribution/display requirements.
- **Status**: Stub endpoint at `/api/reviews-google`. Enable by adding `GOOGLE_API_KEY` and a Place ID.

## Deployment (Vercel)

1. Push the project to a GitHub repository (public or private).
2. In Vercel:
   - Go to **Add New → Project** and import your repository.
   - Set **Framework Preset**: Next.js (auto-detected).
   - Add environment variables:
     ```
     ACCOUNT_ID=your_hostaway_sandbox_account_id
     API_KEY=your_hostaway_sandbox_api_key
     GOOGLE_API_KEY=your_google_api_key (optional)
     ```
   - Use default build command: `next build`.
   - Deploy.
3. Post-deploy checklist:
   - Verify `/api/reviews/hostaway` returns JSON with reviews and listings.
   - Visit `/` to confirm the dashboard loads, filters work, and review cards render.
   - Toggle "Show on Website" to ensure state updates.
   - Visit `/properties/<listing-slug>` to confirm only approved reviews appear.
   - (Optional) Enable `GOOGLE_API_KEY` and verify `/api/reviews-google`.

## Accessibility

- Semantic HTML for sections.
- Labels on inputs, keyboard-focusable buttons.
- Sufficient color contrast for readability.

## License

Internal assessment project.

## Requirement → Implementation Checklist

- **Next.js App Router, Tailwind, TypeScript, Vercel-ready**: Configured in `package.json`, `app/`, `tailwind.config.ts`, `tsconfig.json`, `next.config.ts`.
- **Hostaway sandbox integration**: Implemented in `lib/hostaway.ts` and `app/api/reviews/hostaway/route.ts`.
- **Mock fallback**: `lib/hostaway.ts` imports `/mock/reviews.json` when API returns no reviews.
- **Normalization**: Handled in `lib/normalize.ts` for listing, review type, channel, and date.
- **Dashboard filters/sort**: Implemented in `components/FilterBar.tsx` and `app/page.tsx`.
- **Review approval toggle**: `components/ReviewCard.tsx`, `PATCH /app/api/reviews/[id]/route.ts`, with in-memory store in `lib/approvalsStore.ts`.
- **Public property page**: `app/properties/[listing]/page.tsx` shows approved reviews.
- **Required API route**: `/api/reviews/hostaway` returns normalized data.
- **Google Reviews exploration**: Stubbed in `app/api/reviews-google/route.ts` with README notes.
- **README**: Includes setup, env placeholders, local run, Vercel deploy, and Google exploration notes.
- **No API keys in code**: Uses `.env.local.example` and README instructions.