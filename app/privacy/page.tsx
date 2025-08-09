import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Flex Living Reviews",
  description: "How we handle data in the Flex Living reviews dashboard.",
};

export default function PrivacyPage() {
  return (
    <div className="stack-lg">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-muted">
          This dashboard is used by Flex Living managers to review and moderate guest feedback.
          We store only what's needed to operate the product (review content, basic metadata,
          and moderation flags). No sensitive personal data is collected via this interface.
        </p>

        <div className="mt-4 space-y-2 text-[15px] leading-relaxed">
          <p>
            <span className="text-strong">Data sources:</span> Reviews may come from
            Hostaway and any integrated channels you enable (e.g., Google). Imported
            data is shown read-only unless a manager marks a review as "Show on Website."
          </p>
          <p>
            <span className="text-strong">Retention:</span> Reviews remain until removed
            at the source or archived for reporting.
          </p>
          <p>
            <span className="text-strong">Access:</span> Only authenticated Flex Living staff
            can access this dashboard.
          </p>
          <p className="text-muted text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-6">
          <Link href="/" className="underline">Back to Dashboard</Link>
        </div>
      </section>
    </div>
  );
}