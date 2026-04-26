import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  experimental: {
    // Required for server actions + streaming in Next.js 15
  },
  // These packages must NOT be bundled — they run in Node.js runtime
  serverExternalPackages: ["@supabase/supabase-js", "pdfkit", "iconv-lite"],
  // Local inlined engine/audit are in lib/ — no transpile packages needed
  transpilePackages: [],
  outputFileTracingIncludes: {
    "/api/audit/pdf/route": [
      "lib/intaglio-engine/**/*",
      "lib/intaglio-audit/**/*",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Resolve .ts → .js extension imports from local lib/
      config.resolve.extensionAlias = {
        ".js": [".ts", ".js", ".tsx", ".jsx"],
      };
    }
    return config;
  },
};

export default config;
