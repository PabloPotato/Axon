import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Required for server actions + streaming in Next.js 15
  },
  // Supabase realtime requires this for edge function calls
  // pdfkit and @axon/* must run in Node.js — not bundled by webpack
  serverExternalPackages: ["@supabase/supabase-js", "pdfkit", "@axon/audit", "@axon/engine"],
};

export default config;
