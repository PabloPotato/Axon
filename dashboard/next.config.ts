import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
  experimental: {
    // Required for server actions + streaming in Next.js 15
  },
  // These packages must NOT be bundled — they run in Node.js runtime
  serverExternalPackages: ["@supabase/supabase-js", "pdfkit", "iconv-lite"],
  // Tell Next.js where to find workspace dependencies at build time
  transpilePackages: ["@intaglio/engine", "@intaglio/audit"],
  outputFileTracingIncludes: {
    "/api/audit/pdf/route": [
      "../intaglio-engine/src/**/*",
      "../intaglio-audit/src/**/*",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Resolve .ts → .js extension imports from workspace deps
      // intaglio-engine and intaglio-audit source files use `.js` extensions
      // in their imports (standard for ESM). webpack needs to resolve
      // these to the actual .ts source files when using tsconfig paths.
      config.resolve.extensionAlias = {
        ".js": [".ts", ".js", ".tsx", ".jsx"],
      };
    }
    return config;
  },
};

export default config;
