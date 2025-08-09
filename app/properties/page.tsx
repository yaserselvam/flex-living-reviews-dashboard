// app/properties/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import type { NormalizedReview } from "@/lib/types";
import PublicRefresher from "@/components/PublicRefresher";

export const dynamic = "force-dynamic"; // ensure fresh data

type ListingsMap = Record<string, { name: string; slug: string }>;
type Payload = {
  listings: ListingsMap;
  reviews: NormalizedReview[];
};

function getBaseURL(): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  if (env) return env;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function getPayload(): Promise<Payload> {
  const base = getBaseURL();
  const url = `${base}/api/reviews/hostaway`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    console.error("[properties/getPayload] failed", res.status, res.statusText, url, body?.slice(0, 400));
    throw new Error("Failed to fetch reviews");
  }
  return res.json() as Promise<Payload>;
}


export default async function PropertiesIndex() {
  const payload = await getPayload();
  const listings = Object.values(payload.listings).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Count ALL approved reviews per listing
  const approvedBySlug = payload.reviews.reduce<Record<string, number>>((acc, r) => {
    if (r.approved) acc[r.listingSlug] = (acc[r.listingSlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="py-8 space-y-6">
      <PublicRefresher />

      {/* Hero */}
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="mt-2 text-gray-600">
          Browse Flex Living properties and read verified guest feedback.
        </p>
      </section>

      {/* Grid */}
      <ul className="grid gap-4 sm:grid-cols-2">
        {listings.map((l) => {
          const count = approvedBySlug[l.slug] ?? 0;
          return (
            <li key={l.slug} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">{l.name}</h2>
                  <p className="text-sm text-gray-600">
                    {count} approved review{count === 1 ? "" : "s"}
                  </p>
                </div>
                <Link href={`/properties/${l.slug}`} className="btn btn-ghost">
                  View page
                </Link>
              </div>
            </li>
          );
        })}
        {listings.length === 0 && (
          <li className="card p-4">
            <p className="text-sm text-gray-600">No listings available.</p>
          </li>
        )}
      </ul>
    </div>
  );
}