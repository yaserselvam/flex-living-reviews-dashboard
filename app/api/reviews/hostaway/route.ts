// app/api/reviews/hostaway/route.ts
import { NextResponse } from "next/server";
import { fetchHostawayReviews } from "@/lib/hostaway";
import { getApproval } from "@/lib/approvalsStore";
import { normalizeReviews } from "@/lib/normalize";
import type { NormalizedReview } from "@/lib/types";
import mockRaw from "@/mock/reviews.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) Try Hostaway first
    let payload = await fetchHostawayReviews();

    // 2) If Hostaway returns no reviews (or an unexpected shape), fall back to mock
    if (!payload || !Array.isArray(payload.reviews) || payload.reviews.length === 0) {
      const normalized = normalizeReviews(mockRaw as any[]);
      payload = normalized;
    }

    // 3) Overlay in-memory approvals so UI always reflects the latest toggles
    const reviews = (payload.reviews as NormalizedReview[]).map((r) => ({
      ...r,
      approved: getApproval(r.id) ?? r.approved ?? false,
    }));

    return NextResponse.json({ ...payload, reviews }, { status: 200 });
  } catch (e: any) {
    // On hard failure, still try to return mock data (so the dashboard stays usable)
    try {
      const normalized = normalizeReviews(mockRaw as any[]);
      const reviews = (normalized.reviews as NormalizedReview[]).map((r) => ({
        ...r,
        approved: getApproval(r.id) ?? r.approved ?? false,
      }));
      return NextResponse.json({ ...normalized, reviews }, { status: 200 });
    } catch {
      return NextResponse.json(
        { error: e?.message ?? "Unknown error" },
        { status: 500 }
      );
    }
  }
}