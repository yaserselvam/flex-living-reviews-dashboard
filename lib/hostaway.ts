import { normalizeReviews } from "./normalize";
import type { NormalizedPayload } from "./types";

const DEFAULT_BASE = "https://sandbox-api.hostaway.io"; // fallback if env not set

function getBase(): string {
  const raw = process.env.HOSTAWAY_BASE || DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

function makeHeaders(apiKey: string): HeadersInit {
  // Try both common auth styles (some sandboxes expect one or the other)
  return {
    Authorization: `Bearer ${apiKey}`,
    "X-API-KEY": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function tryFetch(url: string, headers: HeadersInit) {
  try {
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      // If you prefer route cache on the server, swap to: next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[hostaway] fetch failed", url, (err as Error)?.message);
    }
    return null;
  }
}

export async function fetchHostawayReviews(): Promise<NormalizedPayload> {
  const accountId = process.env.ACCOUNT_ID;
  const apiKey = process.env.API_KEY;

  let raw: any[] = [];

  if (accountId && apiKey) {
    const base = getBase();
    const headers = makeHeaders(apiKey);

    // Try a couple of common sandbox shapes
    const candidates = [
      // 1) flat collection with query param
      `${base}/v1/reviews?accountId=${encodeURIComponent(accountId)}`,
      // 2) nested under account
      `${base}/v1/accounts/${encodeURIComponent(accountId)}/reviews`,
    ];

    for (const url of candidates) {
      const data = await tryFetch(url, headers);
      if (data) {
        const arr = Array.isArray((data as any)?.result)
          ? (data as any).result
          : Array.isArray((data as any)?.reviews)
          ? (data as any).reviews
          : Array.isArray(data)
          ? (data as any)
          : [];
        if (arr.length) {
          raw = arr;
          break;
        }
      }
    }
  }

  // Fallback to mock if nothing from API
  if (!raw.length) {
    const mock = await import("@/mock/reviews.json");
    raw = (mock as any).default ?? mock;
  }

  return normalizeReviews(raw);
}