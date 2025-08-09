import { headers } from "next/headers";
import type { NormalizedReview } from "@/lib/types";

export const dynamic = "force-dynamic";

type Payload = {
  listings: Record<string, { name: string; slug: string }>;
  reviews: NormalizedReview[];
};

function getBaseUrl(): string {
  // Prefer explicit env if you set it (e.g. http://localhost:3000)
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (env) return env;

  // Derive from request headers (works locally & on Vercel)
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getPayload(query?: URLSearchParams): Promise<Payload> {
  const base = getBaseUrl();
  const qs = query && query.toString() ? `?${query.toString()}` : "";
  const url = `${base}/api/reviews/hostaway${qs}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    console.error("[getPayload] fetch failed", res.status, res.statusText, url, body.slice(0, 200));
    throw new Error("Failed to fetch reviews");
  }

  return res.json() as Promise<Payload>;
}

/** Safely get a review timestamp in ms no matter the field/type */
function reviewTimeMs(r: NormalizedReview): number {
  const raw: unknown = (r as any).submittedAt ?? (r as any).date;
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? ms : 0;
  }
  return 0;
}

export default async function PropertyPage({ params }: { params: { slug: string } }) {
  const payload = await getPayload();
  const listing = Object.values(payload.listings).find((l) => l.slug === params.slug);

  if (!listing) {
    return <p className="text-sm text-gray-600">Listing not found.</p>;
  }

  // Show ALL approved reviews for this listing, newest first
  const approved = payload.reviews
    .filter((r) => r.listingSlug === listing.slug && r.approved)
    .sort((a, b) => reviewTimeMs(b) - reviewTimeMs(a));

  return (
    <section className="space-y-4">
      <div className="card p-6">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-sand-400/40 bg-sand-50 text-sand-700">
          ⌂
        </span>
        <h1 className="text-xl font-semibold mt-2">{listing.name}</h1>
        <p className="mt-2 text-gray-600">
          Guest reviews curated by Flex Living. Only approved reviews are shown here.
        </p>
      </div>

      {approved.length === 0 ? (
        <p className="text-sm text-gray-600">No approved reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {approved.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{new Date(reviewTimeMs(r)).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</span>
                <span>·</span>
                <span className="capitalize">{r.channel}</span>
              </div>
              {r.comment ? <p className="mt-2">{r.comment}</p> : null}
              {r.categories?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.categories.map((c) => (
                    <span key={c} className="badge">
                      {String(c).replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              ) : null}
              {Number.isFinite(r.rating as number) ? (
                <div className="mt-2 text-sm text-gray-700">⭐ {r.rating}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}