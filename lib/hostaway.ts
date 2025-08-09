import { normalizeReviews } from "./normalize";
import type { NormalizedPayload } from "./types";

// --- Config & env helpers ----------------------------------------------------
const DEFAULT_BASE = "https://sandbox-api.hostaway.io"; // fallback if env not set

function getBase(): string {
  const raw = process.env.HOSTAWAY_BASE_URL || process.env.HOSTAWAY_BASE || DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

function getApiKey(): string | undefined {
  return process.env.HOSTAWAY_API_KEY || process.env.API_KEY;
}

function getAccountId(): string | undefined {
  return process.env.HOSTAWAY_ACCOUNT_ID || process.env.ACCOUNT_ID;
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

// --- Low-level fetch with safety --------------------------------------------
async function tryFetch(url: string, headers: HeadersInit) {
  try {
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
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

// Extract an array of review-like objects from a variety of API shapes
function coerceToArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// --- Public API --------------------------------------------------------------
/**
 * Fetch raw reviews from Hostaway. Never throws; returns [] on failure.
 */
export async function fetchRawHostawayReviews(): Promise<any[]> {
  const accountId = getAccountId();
  const apiKey = getApiKey();

  if (!accountId || !apiKey) {
    return [];
  }

  const base = getBase();
  const headers = makeHeaders(apiKey);

  // Try a few common endpoints/shapes used by sandbox/demo APIs
  const candidates = [
    // 1) flat collection with query param
    `${base}/v1/reviews?accountId=${encodeURIComponent(accountId)}`,
    // 2) nested under account
    `${base}/v1/accounts/${encodeURIComponent(accountId)}/reviews`,
    // 3) sometimes "v2" exists with a different envelope
    `${base}/v2/accounts/${encodeURIComponent(accountId)}/reviews`,
  ];

  for (const url of candidates) {
    const data = await tryFetch(url, headers);
    const arr = coerceToArray(data);
    if (arr.length) return arr;
  }

  return [];
}

/**
 * Fetch and normalize Hostaway reviews. Falls back to mock JSON when no API data.
 * Never throws; always returns a NormalizedPayload.
 */
export async function fetchHostawayReviews(): Promise<NormalizedPayload> {
  // Try API first
  let raw: any[] = await fetchRawHostawayReviews();

  // Fallback to mock if nothing from API
  if (!raw.length) {
    const mock = await import("@/mock/reviews.json");
    raw = (mock as any).default ?? mock;
  }

  return normalizeReviews(raw);
}