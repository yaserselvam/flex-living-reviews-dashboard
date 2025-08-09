// lib/approvalsStore.ts
// In-memory approvals store with HMR-safe singleton (persists across dev reloads).

export type Listener = () => void;
export type ApprovalsMap = Map<string, boolean>;

// Declare globals so the map/listeners survive Next.js Fast Refresh in dev
declare global {
  // eslint-disable-next-line no-var
  var __APPROVALS__: ApprovalsMap | undefined;
  // eslint-disable-next-line no-var
  var __APPROVALS_LISTENERS__: Set<Listener> | undefined;
}

// Single source of truth (survives module reloads in dev)
export const approvals: ApprovalsMap = globalThis.__APPROVALS__ ?? new Map();
if (!globalThis.__APPROVALS__) globalThis.__APPROVALS__ = approvals;

const listeners: Set<Listener> = globalThis.__APPROVALS_LISTENERS__ ?? new Set();
if (!globalThis.__APPROVALS_LISTENERS__) globalThis.__APPROVALS_LISTENERS__ = listeners;

// --- Core API ---------------------------------------------------------------

/** Read current approval. `undefined` -> fall back to review.approved */
export function getApproval(id: string): boolean | undefined {
  return approvals.get(id);
}

/** Set approval and notify listeners */
export function setApproval(id: string, approved: boolean): void {
  approvals.set(id, approved);
  notify();
}

/** Toggle approval, return the new value */
export function toggleApproval(id: string): boolean {
  const next = !(approvals.get(id) ?? false);
  approvals.set(id, next);
  notify();
  return next;
}

// --- Pub/Sub (works server + client) ---------------------------------------

/** Subscribe to changes (returns an unsubscribe fn) */
export function onApprovalsChanged(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  // Call local listeners (server or client)
  for (const l of Array.from(listeners)) {
    try { l(); } catch {}
  }
  // Also emit a browser event if we're in the client
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("reviews-updated"));
  }
}

// --- Browser helper (optional) ---------------------------------------------

/** Manually emit a “reviews-updated” event (used by client components after a PATCH). */
export function emitReviewsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("reviews-updated"));
  }
}