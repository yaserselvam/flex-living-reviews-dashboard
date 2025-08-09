// app/api/reviews/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setApproval } from "@/lib/approvalsStore";

// Ensure no caching for this API route
export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id?: string } }
) {
  const id = params?.id?.trim();
  if (!id) return badRequest("Missing review id in URL");

  let approvedVal: unknown;
  try {
    const body = await req.json();
    approvedVal = (body as any)?.approved;
  } catch {
    return badRequest("Invalid JSON");
  }

  if (typeof approvedVal !== "boolean") {
    return badRequest("approved must be boolean");
  }

  try {
    // persist approval in shared store
    setApproval(id, approvedVal);

    // ensure server pages re-read fresh data
    revalidatePath("/");                          // dashboard
    revalidatePath("/properties");                // properties list
    revalidatePath("/properties/[slug]", "page"); // any property page

    return NextResponse.json({ ok: true, id, approved: approvedVal });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}