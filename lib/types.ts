// lib/types.ts

/** Sort keys available in the UI */
export type Sort = "date_desc" | "date_asc" | "rating_desc" | "rating_asc";

/** Dashboard filter state (client + server) */
export type FilterState = {
  /** Minimum rating, inclusive (1..5) */
  ratingMin: number;
  /** Maximum rating, inclusive (1..5) */
  ratingMax: number;
  /** "all" or a specific normalized category label */
  category: string;
  /** "all" or a specific channel, e.g. "hostaway" | "google" */
  channel: string;
  /** Current sort key */
  sortBy: Sort;
  /** yyyy-mm-dd (optional) */
  from?: string;
  /** yyyy-mm-dd (optional) */
  to?: string;
};

/** One normalized review record */
export type NormalizedReview = {
  id: string;
  listingName: string;
  listingSlug: string;
  /** Visibility/type marker */
  type: "public" | "private";
  /** Source channel, e.g. "hostaway" | "google" */
  channel: string;
  /** 1..5 */
  rating: number;
  /** Normalized category tags */
  categories: string[];
  /** Optional free text comment */
  comment?: string;
  /** Display name for the reviewer */
  guestName?: string;
  /** ISO timestamp string */
  submittedAt: string;
  /** Moderation flag: true -> show on public pages */
  approved: boolean;
};

/** Map of listing slug -> metadata */
export type ListingsMap = Record<
  string,
  {
    name: string;
    slug: string;
  }
>;

/** The payload shape returned by /api/reviews/hostaway */
export type NormalizedPayload = {
  listings: ListingsMap;
  reviews: NormalizedReview[];
};

/** Alias used in a few helpers where the name `Review` is preferable */
export type Review = NormalizedReview;