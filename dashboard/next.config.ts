import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Required for server actions + streaming in Next.js 15
  },
  // Supabase realtime requires this for edge function calls
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default config;
