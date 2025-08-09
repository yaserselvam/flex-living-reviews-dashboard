import { Suspense } from "react";
import Link from "next/link";

export const metadata = {
  title: "Page not found • Flex Living Reviews",
  description: "The page you requested could not be found.",
};

export const dynamic = "force-static";

function NotFoundContent() {
  return (
    <div className="container py-16">
      <section className="card p-8 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-6">
          <Link href="/" className="underline">Back to Dashboard</Link>
        </div>
      </section>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
}