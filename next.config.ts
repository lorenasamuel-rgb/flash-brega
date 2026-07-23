import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    if (!supabaseUrl) return [];
    return [
      {
        source: "/media/photos/:path*",
        destination: `${supabaseUrl}/storage/v1/object/public/photos/:path*`,
      },
    ];
  },
};

export default nextConfig;
