"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Listens for the global "reviews-updated" event and refreshes server data.
 * - Debounced to avoid multiple rapid refreshes
 * - Falls back to window.location.reload() if router.refresh throws
 * - Defers refresh until the tab is visible (saves work in background)
 */
export default function PublicRefresher() {
  const router = useRouter();
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    const flush = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Only refresh when the tab is visible; otherwise wait for visibilitychange
      if (document.visibilityState !== "visible") {
        pendingRef.current = true;
        return;
      }
      try {
        router.refresh();
      } catch {
        // Edge fallback if something odd happens with the router
        try { window.location.reload(); } catch {}
      }
    };

    const schedule = () => {
      // Coalesce bursts of events into a single refresh
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, 150);
    };

    const onVisibility = () => {
      if (pendingRef.current && document.visibilityState === "visible") {
        pendingRef.current = false;
        flush();
      }
    };

    // Listen to the CustomEvent dispatched by the approvals store
    window.addEventListener("reviews-updated", schedule as EventListener);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener("reviews-updated", schedule as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}