// app/api/reviews-google/route.ts
import { NextResponse } from "next/server";
import type { NormalizedReview } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Minimal Google Reviews exploration endpoint.
 * - If GOOGLE_API_KEY and a placeId (query ?placeId=... or env GOOGLE_PLACE_ID) are present,
 *   it will TRY to fetch reviews from the Places API v1.
 * - Otherwise, it returns an empty array with a note. This keeps the assignment non-blocking.
 *
 * ENV:
 *   GOOGLE_API_KEY   = your server-side key
 *   GOOGLE_PLACE_ID  = optional default place id (can be overridden via ?placeId=)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = process.env.GOOGLE_API_KEY;
  const placeId = searchParams.get("placeId") || process.env.GOOGLE_PLACE_ID || "";

  // No key = disabled (documented behavior)
  if (!key) {
    return NextResponse.json(
      {
        reviews: [],
        source: "google",
        note:
          "Google Reviews disabled. Provide GOOGLE_API_KEY (and GOOGLE_PLACE_ID or ?placeId=) to enable; see README.",
      },
      { status: 200 }
    );
  }

  // Key present but no place id -> still return cleanly with guidance
  if (!placeId) {
    return NextResponse.json(
      {
        reviews: [],
        source: "google",
        note:
          "Missing placeId. Set GOOGLE_PLACE_ID in .env.local or pass ?placeId=... in the URL.",
      },
      { status: 200 }
    );
  }

  // Try Places API v1 (non-fatal if it fails)
  // Docs: https://developers.google.com/maps/documentation/places/web-service/details
  // Endpoint (REST): GET https://places.googleapis.com/v1/places/{placeId}?fields=reviews
  // Auth: X-Goog-Api-Key header
  let normalized: NormalizedReview[] = [];
  let note: string | undefined;

  try {
    const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId
    )}?fields=reviews`;

    const res = await fetch(endpoint, {
      // Next.js edge/runtime fetch defaults are fine; avoid caching
      cache: "no-store",
      headers: {
        "X-Goog-Api-Key": key,
        // If you use a restricted key, you may also need: "X-Goog-FieldMask": "reviews"
      },
    });

    if (!res.ok) {
      note = `Google Places request failed: ${res.status} ${res.statusText}`;
    } else {
      const json = await res.json();
      const gReviews = Array.isArray(json?.reviews) ? json.reviews : [];

      normalized = gReviews.map((gr: any, idx: number): NormalizedReview => {
        // Google returns starRating (1..5), originalText/text in different fields depending on locale.
        const rating = Number(gr?.rating ?? gr?.starRating ?? 0);
        const text: string =
          gr?.text?.text ??
          gr?.originalText?.text ??
          gr?.text?.languageCode ??
          "";

        // authorAttribution has displayName
        const guestName: string =
          gr?.authorAttribution?.displayName ??
          gr?.authorAttribution?.uri ??
          "Google user";

        const submittedAt = new Date(gr?.publishTime ?? Date.now()).toISOString();

        // We don't have a listing name from Google in this simple call;
        // fall back to the placeId. In a richer call you could include "displayName".
        const listingName = `Google Place ${placeId.slice(0, 8)}…`;
        const listingSlug = slugify(listingName);

        return {
          id: `google-${placeId}-${idx}`,
          listingName,
          listingSlug,
          type: "public",
          channel: "google",
          rating,
          categories: [], // Google doesn't categorize per our schema
          comment: text,
          guestName,
          submittedAt,
          approved: false, // start false; dashboard can approve
        };
      });

      if (normalized.length === 0) {
        note = "No Google reviews returned for this placeId.";
      }
    }
  } catch (err: any) {
    // Non-fatal: return empty with a note so the frontend remains usable
    note = `Google fetch error: ${err?.message ?? "unknown error"}`;
  }

  return NextResponse.json(
    {
      reviews: normalized,
      source: "google",
      placeId,
      note,
    },
    { status: 200 }
  );
}

// local helper (avoid importing normalize to keep this endpoint lean)
function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}