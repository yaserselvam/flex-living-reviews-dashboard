export const dynamic = "force-dynamic";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Flex Living Reviews",
  description: "Usage terms for the Flex Living reviews dashboard.",
};

export default function TermsPage() {
  return (
    <div className="stack-lg">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <div className="mt-2 space-y-2 text-[15px] leading-relaxed">
          <p>
            By using this dashboard, you agree to use it for legitimate business purposes only.
            Do not upload sensitive personal data. Content visibility controls ("Show on Website")
            are your responsibility and should reflect Flex Living's publishing policies.
          </p>
          <p>
            The software is provided "as is." We aim for high availability, but occasional maintenance
            or outages may occur.
          </p>
          <p>
            Flex Living reserves the right to update these terms. Continued use constitutes acceptance
            of any changes.
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