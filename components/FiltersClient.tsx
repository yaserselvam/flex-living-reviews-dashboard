"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "@/lib/types";
import FilterBar from "./FilterBar";

type Props = {
  initialFilters: FilterState;
  categories: string[];
  channels: string[];
};

// Centralize defaults so both URL <-> state use the same values
const DEFAULTS: Required<
  Pick<
    FilterState,
    "ratingMin" | "ratingMax" | "category" | "channel" | "from" | "to" | "sortBy"
  >
> = {
  ratingMin: 1,
  ratingMax: 5,
  category: "all",
  channel: "all",
  from: "",
  to: "",
  sortBy: "date_desc",
};

function parseFromSearch(sp: URLSearchParams): FilterState {
  const rawMin = sp.get("ratingMin");
  const rawMax = sp.get("ratingMax");
  const ratingMin = rawMin === null || rawMin === "" ? NaN : Number(rawMin);
  const ratingMax = rawMax === null || rawMax === "" ? NaN : Number(rawMax);
  const category = sp.get("category") ?? DEFAULTS.category;
  const channel = sp.get("channel") ?? DEFAULTS.channel;
  const from = sp.get("from") ?? DEFAULTS.from;
  const to = sp.get("to") ?? DEFAULTS.to;
  const sortBy = (sp.get("sortBy") as FilterState["sortBy"]) ?? DEFAULTS.sortBy;

  return {
    ratingMin: Number.isFinite(ratingMin) ? ratingMin : DEFAULTS.ratingMin,
    ratingMax: Number.isFinite(ratingMax) ? ratingMax : DEFAULTS.ratingMax,
    category: category || DEFAULTS.category,
    channel: channel || DEFAULTS.channel,
    from: from || DEFAULTS.from,
    to: to || DEFAULTS.to,
    sortBy: sortBy || DEFAULTS.sortBy,
  };
}

function buildQueryFromState(state: FilterState): string {
  const q = new URLSearchParams();
  if (state.ratingMin !== DEFAULTS.ratingMin) q.set("ratingMin", String(state.ratingMin));
  if (state.ratingMax !== DEFAULTS.ratingMax) q.set("ratingMax", String(state.ratingMax));
  if (state.category && state.category !== DEFAULTS.category) q.set("category", state.category);
  if (state.channel && state.channel !== DEFAULTS.channel) q.set("channel", state.channel);
  if (state.from && state.from !== DEFAULTS.from) q.set("from", state.from);
  if (state.to && state.to !== DEFAULTS.to) q.set("to", state.to);
  if (state.sortBy && state.sortBy !== DEFAULTS.sortBy) q.set("sortBy", state.sortBy);
  return q.toString();
}

function filtersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.ratingMin === b.ratingMin &&
    a.ratingMax === b.ratingMax &&
    a.category === b.category &&
    a.channel === b.channel &&
    (a.from || "") === (b.from || "") &&
    (a.to || "") === (b.to || "") &&
    a.sortBy === b.sortBy
  );
}

export default function FiltersClient({ initialFilters, categories, channels }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterState>(initialFilters);
  const [isPending, startTransition] = useTransition();

  // Refs to prevent thrash/loops
  const debounceRef = useRef<number | null>(null);
  const lastPushedQS = useRef<string>(""); // what we last wrote to the URL

  // 1) URL -> state: when user uses back/forward or external navigation updates the query
  useEffect(() => {
    const fromURL = parseFromSearch(new URLSearchParams(searchParams.toString()));
    if (!filtersEqual(fromURL, state)) {
      setState(fromURL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2) state -> URL: write only non-defaults, avoid history spam, debounce writes
  useEffect(() => {
    const qs = buildQueryFromState(state);
    // Short-circuit if URL already matches what we intend to write
    if (qs === searchParams.toString() || qs === lastPushedQS.current) {
      return;
    }

    // Debounce pushing URL to avoid jitter while typing/changing inputs
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const nextHref = qs ? `/?${qs}` : "/";
      lastPushedQS.current = qs;

      // Use replace to avoid history spam
      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }, 200); // 200ms feels responsive without thrash

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const catList = useMemo(() => categories, [categories]);
  const chanList = useMemo(() => channels, [channels]);

  return (
    <FilterBar
      state={state}
      setState={setState}
      categories={catList}
      channels={chanList}
    />
  );
}