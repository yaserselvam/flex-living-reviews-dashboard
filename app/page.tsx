// app/page.tsx
import type { NormalizedReview, FilterState } from "@/lib/types";
import ReviewCard from "@/components/ReviewCard";
import FiltersClient from "@/components/FiltersClient";
import { headers } from "next/headers";
import PublicRefresher from "@/components/PublicRefresher";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

type Payload = {
  listings: Record<string, { name: string; slug: string }>;
  reviews: NormalizedReview[];
};

/* ----------------------------- helpers ----------------------------- */
function first<T>(v: T | T[] | undefined | null): T | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}
function toInt(v: string | string[] | undefined, fallback: number): number {
  const raw = first(v);
  if (raw == null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
function toStr(v: string | string[] | undefined, fallback: string): string {
  const raw = first(v);
  return typeof raw === "string" && raw.length > 0 ? raw : fallback;
}
function toDateMs(s?: string): number | undefined {
  if (!s) return undefined;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : undefined;
}

/** Robust average that ignores undefined ratings */
function averageRating(list: NormalizedReview[]): number {
  const nums = list.map((r) => r.rating ?? 0).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return 0;
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / nums.length;
}

/** Fallback-safe categories accessor (legacy compat) */
function reviewCategories(r: NormalizedReview): string[] {
  // @ts-expect-error legacy key support
  return (r.categories ?? r.category ?? r.reviewCategory ?? []) as string[];
}

/** Fallback-safe date accessor */
function reviewDateMs(r: NormalizedReview): number {
  // @ts-expect-error legacy key support
  const iso = (r.submittedAt ?? r.date ?? r.createdAt) as string | undefined;
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
}

/* ------------------------- data fetching -------------------------- */
function getBaseUrl(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/+$/, "");
}

async function getPayload(): Promise<Payload> {
  const base = getBaseUrl();
  const url = `${base}/api/reviews/hostaway`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    console.error("[getPayload] fetch failed", res.status, res.statusText, url, body.slice(0, 200));
    throw new Error("Failed to fetch reviews");
  }
  return res.json() as Promise<Payload>;
}

/* ------------------------ server-side filter ---------------------- */
function applyFilters(reviews: NormalizedReview[], filters: FilterState): NormalizedReview[] {
  let out = reviews.filter((r) => {
    const rating = r.rating ?? 0;
    if (rating < (filters.ratingMin ?? 1)) return false;
    if (rating > (filters.ratingMax ?? 5)) return false;

    if (filters.category && filters.category !== "all") {
      const cats = reviewCategories(r).map(String);
      if (!cats.includes(filters.category)) return false;
    }
    if (filters.channel && filters.channel !== "all") {
      if ((r.channel ?? "").toString() !== filters.channel) return false;
    }

    const t = reviewDateMs(r);
    const fromMs = toDateMs(filters.from);
    const toMs = toDateMs(filters.to);
    if (fromMs && t < fromMs) return false;
    if (toMs && t > toMs) return false;

    return true;
  });

  switch (filters.sortBy ?? "date_desc") {
    case "date_asc":
      out = out.slice().sort((a, b) => reviewDateMs(a) - reviewDateMs(b));
      break;
    case "rating_desc":
      out = out.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "rating_asc":
      out = out.slice().sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
      break;
    case "date_desc":
    default:
      out = out.slice().sort((a, b) => reviewDateMs(b) - reviewDateMs(a));
  }

  return out;
}

/* ------------------------------ page ----------------------------- */
export default async function DashboardPage({ searchParams }: PageProps) {
  const payload = await getPayload();

  // Build initial filters from URL (so the client picks them up immediately)
  const initialFilters: FilterState = {
    ratingMin: toInt(searchParams.ratingMin, 1),
    ratingMax: toInt(searchParams.ratingMax, 5),
    category: toStr(searchParams.category, "all"),
    channel: toStr(searchParams.channel, "all"),
    from: toStr(searchParams.from, ""),
    to: toStr(searchParams.to, ""),
    sortBy: toStr(searchParams.sortBy, "date_desc") as FilterState["sortBy"],
  };

  // KPI numbers (unfiltered so they reflect the dataset)
  const total = payload.reviews.length;
  const avg = averageRating(payload.reviews);
  const approvedCount = payload.reviews.filter((r) => r.approved).length;

  // Dropdown datasets
  const categories = Array.from(
    new Set(payload.reviews.flatMap((r) => reviewCategories(r).map(String)))
  ).sort();

  const channels = Array.from(
    new Set(payload.reviews.map((r) => (r.channel ?? "").toString()))
  )
    .filter(Boolean)
    .sort();

  // Server-side list based on current URL (so first paint matches the filters)
  const filtered = applyFilters(payload.reviews, initialFilters);

  return (
    <div className="stack-lg">
      {/* Auto-refresh KPIs and list after toggles */}
      <PublicRefresher />

      {/* KPIs */}
      <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
        <div className="kpi">
          <div className="kpi-title">Reviews</div>
          <div className="kpi-value">{total}</div>
        </div>

        <div className="kpi">
          <div className="kpi-title">Average rating</div>
          <div className="kpi-value">{avg.toFixed(2)}</div>
        </div>

        <div className="kpi">
          <div className="kpi-title">Approved</div>
          <div className="kpi-value">{approvedCount}</div>
        </div>
      </div>

      {/* Filters – client component manages state <-> URL syncing and renders FilterBar */}
      <FiltersClient
        initialFilters={initialFilters}
        categories={categories}
        channels={channels}
      />

      {/* Reviews list */}
      <div className="grid gap-4">
        {filtered.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}