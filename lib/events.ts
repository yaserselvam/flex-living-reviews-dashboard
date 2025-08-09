// lib/events.ts
// Cross-tab + same-tab review update notifications with safe fallbacks.

export const REVIEWS_UPDATED_CHANNEL = "reviews-updated" as const;

export type ReviewsUpdatedPayload = {
  type: "changed";
  ts: number; // milliseconds
};

// Keep a singleton BroadcastChannel across Fast Refresh in dev
declare global {
  // eslint-disable-next-line no-var
  var __REVIEWS_BC__: BroadcastChannel | null | undefined;
}

function getBroadcastChannel(): BroadcastChannel | null {
  try {
    if (typeof window === "undefined") return null;
    if (!("BroadcastChannel" in window)) return null;
    if (!globalThis.__REVIEWS_BC__) {
      globalThis.__REVIEWS_BC__ = new BroadcastChannel(REVIEWS_UPDATED_CHANNEL);
    }
    return globalThis.__REVIEWS_BC__!;
  } catch {
    return null;
  }
}

/** Notify all listeners (this tab + other tabs) that reviews have changed. */
export function notifyReviewsUpdated(): void {
  const payload: ReviewsUpdatedPayload = { type: "changed", ts: Date.now() };

  // Cross-tab notify
  const bc = getBroadcastChannel();
  try {
    bc?.postMessage(payload);
  } catch {}

  // Same-tab fallback (or in addition) via a DOM event
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event(REVIEWS_UPDATED_CHANNEL));
    } catch {}
  }
}

/** Subscribe to updates. Returns an unsubscribe function. */
export function onReviewsUpdated(cb: () => void): () => void {
  const bc = getBroadcastChannel();

  // Cross-tab listener
  const onMessage = () => cb();
  try {
    bc?.addEventListener("message", onMessage as EventListener);
  } catch {}

  // Same-tab listener
  const onDomEvent = () => cb();
  if (typeof window !== "undefined") {
    window.addEventListener(REVIEWS_UPDATED_CHANNEL, onDomEvent);
  }

  return () => {
    try { bc?.removeEventListener("message", onMessage as EventListener); } catch {}
    if (typeof window !== "undefined") {
      window.removeEventListener(REVIEWS_UPDATED_CHANNEL, onDomEvent);
    }
  };
}