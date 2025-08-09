# Flex Living Reviews Dashboard

## Introduction

This project is a completed manager dashboard and public review pages application for Flex Living properties. It was developed as part of an internal assessment to demonstrate proficiency with Next.js (App Router), React, TypeScript, and Tailwind CSS, along with API integration and state management. The project is now fully functional and deployed on Vercel for live access and demonstration.

The dashboard allows property managers to view, filter, and approve guest reviews fetched from the Hostaway sandbox API, with a fallback to mock data if needed. Approved reviews are then publicly displayed on property-specific pages. The project also includes a stubbed Google Reviews API endpoint for potential future expansion.

## Features

- **Dashboard with Filters and Sorting**: Filter reviews by rating, category, channel, and date range. Sort reviews by date or rating.
- **API Integration**: Fetches reviews from Hostaway sandbox API with fallback to local mock data.
- **Review Approval Toggle**: Managers can approve or unapprove reviews via a toggle; approval status is persisted in an in-memory store.
- **Public Reviews Page**: Displays only approved reviews for each property, accessible via `/properties/[listing]`.
- **Responsive UI**: Built with Tailwind CSS for consistent styling and responsiveness.
- **Sticky Footer and Top Navigation Bar**: For improved user experience and accessibility.
- **Stubbed Google Reviews Endpoint**: `/api/reviews-google` provides a placeholder for integrating Google Reviews with proper API keys.
- **Accessibility**: Semantic HTML, keyboard navigable controls, and sufficient color contrast.

## Installation & Local Development

Follow these steps to set up and run the project locally:

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd flex-living-reviews-dashboard
   ```

2. **Install dependencies** (using your preferred package manager):

   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Create and configure environment variables**:

   Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and set the following variables:

   ```
   ACCOUNT_ID=your_hostaway_sandbox_account_id
   API_KEY=your_hostaway_sandbox_api_key
   GOOGLE_API_KEY=your_google_api_key (optional, for Google Reviews exploration)
   ```

   Replace the placeholder values with your actual API credentials.

4. **Run the development server**:

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Deployment

This project is configured for deployment on Vercel, leveraging Next.js App Router features for server-side rendering and API routes.

### Deployment Steps:

1. **Push the project to a GitHub repository** (public or private):

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set up a new project in Vercel**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New → Project** and import your GitHub repository.
   - Vercel will auto-detect the Next.js framework.
   - Add the following environment variables in the Vercel project settings:

     ```
     ACCOUNT_ID=your_hostaway_sandbox_account_id
     API_KEY=your_hostaway_sandbox_api_key
     GOOGLE_API_KEY=your_google_api_key (optional)
     ```

3. **Deploy the project**:

   - Use the default build command `next build`.
   - Trigger deployment by pushing new commits or manually from the Vercel dashboard.

4. **Post-deployment verification**:

   - Confirm `/api/reviews/hostaway` returns JSON with listings and reviews.
   - Visit `/` to ensure the dashboard loads correctly, filters and sorting work, and review cards render.
   - Test toggling "Show on Website" for reviews updates their approval status.
   - Access `/properties/<listing-slug>` to verify only approved reviews display.
   - (Optional) Enable `GOOGLE_API_KEY` and test `/api/reviews-google` endpoint.

## Project Structure

```
flex-living-reviews-dashboard/
├── app/
│   ├── api/
│   │   ├── reviews/
│   │   │   ├── hostaway/
│   │   │   │   └── route.ts           # Hostaway API route handler
│   │   │   └── [id]/
│   │   │       └── route.ts           # PATCH review approval API route
│   │   └── reviews-google/
│   │       └── route.ts               # Stub Google Reviews API route
│   ├── properties/
│   │   └── [listing]/
│   │       └── page.tsx               # Public property reviews page
│   ├── page.tsx                      # Dashboard main page
│   └── layout.tsx                    # Application layout with topnav and footer
├── components/
│   ├── FilterBar.tsx                 # Filters and sorting UI components
│   ├── ReviewCard.tsx                # Individual review display and approval toggle
│   └── ...                          # Other UI components
├── lib/
│   ├── approvalsStore.ts             # In-memory store for review approvals
│   ├── hostaway.ts                   # Hostaway API fetching and fallback logic
│   └── normalize.ts                  # Data normalization utilities
├── mock/
│   └── reviews.json                  # Mock reviews fallback data
├── public/
│   └── ...                          # Static assets
├── styles/
│   └── globals.css                   # Global Tailwind CSS styles
├── .env.local.example                # Example environment variables file
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies and scripts
└── README.md                        # Project documentation (this file)
```

## API Overview

- **GET /api/reviews/hostaway**  
  Returns normalized JSON data containing listings and reviews fetched from Hostaway sandbox API, with fallback to mock data if no reviews are returned.

- **PATCH /api/reviews/[id]**  
  Accepts `{ "approved": true|false }` in the request body to update the approval status of a review. Uses an in-memory store for persistence during runtime.

- **GET /api/reviews-google** (optional)  
  Stub endpoint returning an empty array unless `GOOGLE_API_KEY` is configured, intended for future Google Reviews integration.

## Known Issues

- **In-memory approval store**: The current implementation stores review approval states in memory, which resets on server restarts. For production, this should be replaced with persistent storage such as Vercel KV, Postgres, or Supabase.
- **Google Reviews integration**: The Google Reviews endpoint is stubbed and requires API keys and Place IDs to function fully.
- **Limited error handling**: Some API error scenarios may not be fully surfaced to users; improvements could be made for better UX.

## Future Improvements

- **Persistent storage for approvals**: Integrate a database or key-value store to persist review approval status across deployments.
- **Full Google Reviews integration**: Implement fetching and displaying Google Reviews with proper attribution and compliance with Google’s policies.
- **Enhanced filtering and sorting**: Add more granular filter options and multi-criteria sorting.
- **User authentication**: Add login functionality to secure the dashboard and restrict approval actions.
- **Unit and integration tests**: Increase test coverage for API routes and React components.
- **Improved accessibility**: Conduct audits and enhance keyboard navigation and screen reader support.

## Accessibility

- Uses semantic HTML elements for structure.
- All inputs have associated labels.
- Buttons and interactive elements are keyboard-focusable.
- Color contrast meets accessibility standards.

## License

Internal assessment project.

---

Thank you for reviewing the Flex Living Reviews Dashboard project. For any questions or contributions, please open an issue or pull request on the GitHub repository.