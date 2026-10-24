import type { NextConfig } from "next";

const supabaseUrl = process.env.SUPABASE_URL?.trim()
  .replace(/\/+$/, "")
  .replace(/\/(rest|auth|storage)\/v1$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Uploaded product photos are served from Supabase Storage.
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
};

export default nextConfig;
