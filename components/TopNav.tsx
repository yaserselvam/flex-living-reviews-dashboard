"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopNav() {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? "/"; // guard for Next returning null briefly
  const sp = useSearchParams();

  // -- Where am I? -----------------------------------------------------------
  const isOnPublic = pathname.startsWith("/properties");

  // Create a stable string of the current query params
  const currentQS = useMemo(() => sp.toString(), [sp]);

  // Link to public page (carry dashboard filters forward as ?return=<qs>)
  const toPublicHref = useMemo(() => {
    if (!currentQS) return "/properties";
    return `/properties?return=${encodeURIComponent("?" + currentQS)}`;
  }, [currentQS]);

  // If I'm on public, provide a safe "Back to Dashboard"
  const returnQS = sp.get("return") ?? "";
  const toDashboardHref = useMemo(() => {
    if (!returnQS || returnQS === "?" || returnQS.trim().length <= 1) return "/";
    const qs = returnQS.startsWith("?") ? returnQS : `?${returnQS}`;
    return `/${qs}`;
  }, [returnQS]);

  const href = isOnPublic ? toDashboardHref : toPublicHref;
  const label = isOnPublic ? "Back to Dashboard" : "Public reviews";

  // Cream -> green transition on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // initialize once
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="brand-rail" aria-hidden="true" />
      <div className="container flex items-center justify-between">
        {/* Logo (SVG mark + word) */}
        <Link href="/" prefetch={false} className="logo header-link" aria-label="Flex Living home">
          <svg viewBox="0 0 48 48" aria-hidden="true" className="logo-mark">
            {/* house outline */}
            <path
              d="M8 22 L24 10 L40 22 V38a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* serif 'f' (use dy instead of dominantBaseline to avoid TS SVG prop issues) */}
            <text
              x="24"
              y="36"
              textAnchor="middle"
              dy=".1em"
              fontFamily="var(--logo-serif, ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif)"
              fontWeight="400"
              fontSize="22"
              fill="currentColor"
            >
              f
            </text>
          </svg>
          <span className="font-serif tracking-wide logo-word">the flex.</span>
        </Link>

        {/* Right-side pill */}
        <Link
          href={href as any}
          prefetch={false}
          className="nav-pill nav-btn header-link"
          aria-current={isOnPublic ? "page" : undefined}
        >
          {/* eye icon */}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 5c5.5 0 9.5 5.5 9.5 7s-4 7-9.5 7S2.5 13.5 2.5 12 6.5 5 12 5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>{label}</span>
        </Link>
      </div>
    </header>
  );
}