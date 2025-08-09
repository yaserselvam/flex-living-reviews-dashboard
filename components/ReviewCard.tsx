"use client";

import { useState, useTransition } from "react";
import type { NormalizedReview } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { emitReviewsUpdated } from "@/lib/approvalsStore";

type Props = {
  review: NormalizedReview;
  onToggle?: (id: string, approved: boolean) => Promise<void> | void;
};

export default function ReviewCard({ review, onToggle }: Props) {
  const [localApproved, setLocalApproved] = useState<boolean>(!!review.approved);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !localApproved;

    // Optimistic UI
    setLocalApproved(next);

    startTransition(async () => {
      try {
        if (onToggle) {
          await onToggle(review.id, next);
        } else {
          const res = await fetch(`/api/reviews/${review.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: next }),
            cache: "no-store",
          });
          if (!res.ok) throw new Error(await res.text());
        }
        // Tell listeners (public pages) to refresh
        emitReviewsUpdated();
      } catch {
        // Revert on error
        setLocalApproved((prev) => !prev);
      }
    });
  };

  return (
    <article className={`card p-4 sm:p-5 ${localApproved ? "card--approved" : ""}`}>
      {/* meta row */}
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatDate(review.submittedAt)}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-[var(--line)]" aria-hidden="true" />
          <span className="chip chip-outline capitalize">{review.channel}</span>
          <span className="inline-flex items-center gap-1 ml-2">
            <span
              className={`status-dot ${localApproved ? "status-dot--on" : "status-dot--off"}`}
              aria-hidden="true"
            />
            <span aria-live="polite">{localApproved ? "showing" : "hidden"}</span>
          </span>
        </div>

        {/* rating badge */}
        <div className="flex items-center gap-1 text-[13px] text-strong">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.1 6.2L12 17.8 6.5 20l1.1-6.2L3 9.6l6.3-.8L12 3Z" fill="currentColor" />
          </svg>
          <span className="font-semibold">{review.rating}</span>
        </div>
      </div>

      {/* title */}
      <h3 className="mt-2 text-lg sm:text-xl font-semibold text-strong">{review.listingName}</h3>

      {/* comment */}
      {review.comment ? (
        <p className="mt-2 text-[15px] leading-relaxed">{review.comment}</p>
      ) : null}

      {/* categories */}
      {review.categories?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.categories.map((c) => (
            <span key={c} className="chip chip-soft">
              {String(c).replaceAll("_", " ")}
            </span>
          ))}
        </div>
      ) : null}

      {/* actions */}
      <div className="mt-4">
        <button
          onClick={toggle}
          disabled={isPending}
          aria-busy={isPending}
          className={`btn ${localApproved ? "btn-success" : "btn-ghost"}`}
        >
          {localApproved ? "Showing on Website" : "Show on Website"}
        </button>
      </div>
    </article>
  );
}