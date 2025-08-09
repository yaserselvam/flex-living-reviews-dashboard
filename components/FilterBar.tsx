"use client";

import { useMemo, useCallback } from "react";
import type { FilterState } from "@/lib/types";

type Props = {
  state: FilterState;
  setState: (updater: (s: FilterState) => FilterState) => void;
  categories: string[];
  channels: string[];
};

function clampRating(n: number) {
  if (!Number.isFinite(n)) return 1;
  if (n < 1) return 1;
  if (n > 5) return 5;
  return Math.round(n);
}

export default function FilterBar({ state, setState, categories, channels }: Props) {
  const catList = useMemo(
    () => ["all", ...Array.from(new Set(categories)).sort()],
    [categories]
  );
  const chanList = useMemo(
    () => ["all", ...Array.from(new Set(channels)).sort()],
    [channels]
  );

  // Ensure ratingMin <= ratingMax and values in [1..5]
  const applyRating = useCallback(
    (min: number, max: number) => {
      const rMin = clampRating(min);
      const rMax = clampRating(max);
      if (rMin > rMax) {
        return setState((s) => ({ ...s, ratingMin: rMax, ratingMax: rMin }));
      }
      setState((s) => ({ ...s, ratingMin: rMin, ratingMax: rMax }));
    },
    [setState]
  );

  const onMinChange = (val: string) => {
    const n = Number(val);
    applyRating(Number.isFinite(n) ? n : 1, state.ratingMax ?? 5);
  };

  const onMaxChange = (val: string) => {
    const n = Number(val);
    applyRating(state.ratingMin ?? 1, Number.isFinite(n) ? n : 5);
  };

  const reset = () =>
    setState(() => ({
      ratingMin: 1,
      ratingMax: 5,
      category: "all",
      channel: "all",
      sortBy: "date_desc",
      from: "",
      to: "",
    }));

  return (
    <section className="card p-4 sm:p-5" aria-label="Filters">
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-6">
        {/* Min rating */}
        <div>
          <label htmlFor="flt-min" className="block text-sm font-medium text-muted">Min rating</label>
          <input
            id="flt-min"
            inputMode="numeric"
            type="number"
            min={1}
            max={5}
            value={state.ratingMin ?? 1}
            onChange={(e) => onMinChange(e.target.value)}
            onBlur={(e) => onMinChange(e.target.value)}
            className="input mt-1"
            aria-describedby="flt-min-help"
          />
          <span id="flt-min-help" className="sr-only">Enter a value between 1 and 5</span>
        </div>

        {/* Max rating */}
        <div>
          <label htmlFor="flt-max" className="block text-sm font-medium text-muted">Max rating</label>
          <input
            id="flt-max"
            inputMode="numeric"
            type="number"
            min={1}
            max={5}
            value={state.ratingMax ?? 5}
            onChange={(e) => onMaxChange(e.target.value)}
            onBlur={(e) => onMaxChange(e.target.value)}
            className="input mt-1"
            aria-describedby="flt-max-help"
          />
          <span id="flt-max-help" className="sr-only">Enter a value between 1 and 5</span>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="flt-category" className="block text-sm font-medium text-muted">Category</label>
          <select
            id="flt-category"
            value={state.category ?? "all"}
            onChange={(e) => setState((s) => ({ ...s, category: e.target.value }))}
            className="select mt-1"
          >
            {catList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Channel */}
        <div>
          <label htmlFor="flt-channel" className="block text-sm font-medium text-muted">Channel</label>
          <select
            id="flt-channel"
            value={state.channel ?? "all"}
            onChange={(e) => setState((s) => ({ ...s, channel: e.target.value }))}
            className="select mt-1"
          >
            {chanList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* From */}
        <div>
          <label htmlFor="flt-from" className="block text-sm font-medium text-muted">From</label>
          <input
            id="flt-from"
            type="date"
            value={state.from ?? ""}
            onChange={(e) => setState((s) => ({ ...s, from: e.target.value }))}
            className="input mt-1"
          />
        </div>

        {/* To */}
        <div>
          <label htmlFor="flt-to" className="block text-sm font-medium text-muted">To</label>
          <input
            id="flt-to"
            type="date"
            value={state.to ?? ""}
            onChange={(e) => setState((s) => ({ ...s, to: e.target.value }))}
            className="input mt-1"
          />
        </div>

        {/* Sort (full row) */}
        <div className="sm:col-span-3 md:col-span-6">
          <label htmlFor="flt-sort" className="block text-sm font-medium text-muted">Sort</label>
          <select
            id="flt-sort"
            value={state.sortBy ?? "date_desc"}
            onChange={(e) => setState((s) => ({ ...s, sortBy: e.target.value as FilterState["sortBy"] }))}
            className="select mt-1 w-full"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="rating_desc">Rating: high → low</option>
            <option value="rating_asc">Rating: low → high</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={reset} className="btn btn-ghost">
          Reset filters
        </button>
      </div>
    </section>
  );
}