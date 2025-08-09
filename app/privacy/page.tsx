export const metadata = {
  title: "Privacy Policy • Flex Living Reviews Dashboard",
  description: "Privacy policy for the Flex Living Reviews Dashboard demo app.",
};

export const dynamic = "force-static"; // allow static prerender

export default function PrivacyPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        This demo application displays accommodation reviews and basic property information.
        It does not store personal data beyond what is necessary to render reviews coming from
        the sandbox API or local mock data. For production use, integrate your own data-retention
        and privacy controls.
      </p>

      <h2 className="mt-8 text-lg font-medium">What we collect</h2>
      <ul className="mt-3 list-disc pl-6 text-[15px] leading-relaxed">
        <li>Review content and metadata (rating, date, channel, listing).</li>
        <li>Ephemeral approval state kept in memory on the server during runtime.</li>
      </ul>

      <h2 className="mt-8 text-lg font-medium">What we don’t collect</h2>
      <ul className="mt-3 list-disc pl-6 text-[15px] leading-relaxed">
        <li>User accounts or authentication data.</li>
        <li>Payment or financial information.</li>
        <li>Persistent identifiers for visitors.</li>
      </ul>

      <h2 className="mt-8 text-lg font-medium">Data retention</h2>
      <p className="mt-3 text-[15px] leading-relaxed">
        Approval choices are stored in memory only and reset when the server restarts.
        No long-term storage is performed by this demo.
      </p>

      <h2 className="mt-8 text-lg font-medium">Contact</h2>
      <p className="mt-3 text-[15px] leading-relaxed">
        For questions about this demo dashboard, please contact the project maintainer.
      </p>
    </div>
  );
}