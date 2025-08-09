// app/layout.tsx
import "./globals.css";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Flex Living Reviews Dashboard",
  description: "Manage and view public reviews",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--flex-cream)]">
        <Suspense fallback={null}>
          <TopNav />
        </Suspense>

        <main className="container stack-lg page">
          <Suspense fallback={null}>{children}</Suspense>
        </main>

        <Footer />
      </body>
    </html>
  );
}