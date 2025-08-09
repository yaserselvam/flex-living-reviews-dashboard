/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,

  // Helpful in dev: keep typedRoutes on.
  experimental: {
    typedRoutes: true,
  },

  // Allow common Google image hosts if you later render reviewer avatars, etc.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
  },

  // Keep CI friendly on Vercel; don't block the build on lint warnings.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Keep TS strict but fail on actual type errors (safer than ignoring).
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;