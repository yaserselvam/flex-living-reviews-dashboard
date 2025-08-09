// app/layout.tsx
import "./globals.css";
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
        <TopNav />
        <main className="container stack-lg page">{children}</main>
        <Footer />
      </body>
    </html>
  );
}