// lib/normalize.ts
import type { NormalizedPayload, NormalizedReview, ListingsMap } from "./types";
import { approvals } from "./approvalsStore";
import rawBase from "@/mock/reviews.json"; // uses tsconfig paths

/* -------------------------------- Utilities ------------------------------- */
export function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

/** Normalize raw records (Hostaway/mocks) into our app's shape. */
export function normalizeReviews(raw: any[]): NormalizedPayload {
  const reviews: NormalizedReview[] = raw.map((r) => {
    const listingName: string = r.listingName ?? r.listing?.name ?? "Unknown";
    const listingSlug = slugify(listingName);

    const id: string = String(
      r.id ?? r.reviewId ?? `${listingSlug}-${r.createdAt ?? Date.now()}`
    );

    const rating = Number(r.rating ?? r.overallRating ?? 0);

    const categories: string[] =
      r.categories ?? r.reviewCategory ?? r.scores ?? [];

    const typeVal = (r.type ?? r.visibility ?? "public") as
      | "public"
      | "private";

    const submittedAtISO = new Date(
      r.submittedAt ?? r.createdAt ?? Date.now()
    ).toISOString();

    return {
      id,
      listingName,
      listingSlug,
      type: typeVal,
      channel: r.channel ?? "hostaway",
      rating,
      categories,
      comment: r.comment ?? r.text ?? r.privateFeedback ?? "",
      guestName: r.guestName ?? r.author ?? r.reviewerName ?? "Guest",
      submittedAt: submittedAtISO,
      approved: Boolean(r.approved ?? false),
    };
  });

  const listings: ListingsMap = Object.fromEntries(
    Array.from(new Set(reviews.map((r) => r.listingSlug))).map((slug) => {
      const name = reviews.find((r) => r.listingSlug === slug)?.listingName ?? slug;
      return [slug, { name, slug }];
    })
  );

  return { listings, reviews };
}

/* ------------------------------ Base Payload ------------------------------ */
// Normalize once at module load. If you later replace JSON with API data, keep shape.
const base: NormalizedPayload = normalizeReviews(rawBase as any[]);

/* --------------------------- Read Helpers (API) --------------------------- */
/**
 * Return ALL reviews, with the current in-memory approval override applied.
 * (If an id isn't in approvals, we fall back to the JSON/default approved.)
 */
export function getAllReviews(): NormalizedReview[] {
  return base.reviews.map((r) => ({
    ...r,
    approved: approvals.has(r.id) ? !!approvals.get(r.id) : !!r.approved,
  }));
}

/** Reviews for a specific listing slug (approval override applied). */
export function getReviewsByListing(slug: string): NormalizedReview[] {
  return getAllReviews().filter((r) => r.listingSlug === slug);
}

/** The listings map (slug → { name, slug }). */
export function getListings(): ListingsMap {
  return base.listings;
}

/** Unique channels present in the base data. */
export function getChannels(): string[] {
  return Array.from(new Set(base.reviews.map((r) => r.channel))).filter(Boolean).sort();
}

/** Unique categories present in the base data. */
export function getCategories(): string[] {
  const set = new Set<string>();
  base.reviews.forEach((r) => (r.categories ?? []).forEach((c: string) => set.add(String(c))));
  return Array.from(set).sort();
}