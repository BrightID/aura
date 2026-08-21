#!/usr/bin/env node

/**
 * Postbuild script: injects proxy rewrites into .vercel/output/config.json
 *
 * Vercel's Build Output API v3 ignores rewrites defined in vercel.json,
 * so we need to patch the generated config directly.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const configPath = resolve(
  import.meta.dirname,
  "..",
  ".vercel",
  "output",
  "config.json"
);

const config = JSON.parse(readFileSync(configPath, "utf-8"));

const proxyRewrites = [
  {
    src: "/dashboard/:path*",
    dest: "https://aura-dashboard-rust.vercel.app/dashboard/:path*",
  },
  {
    src: "/interface/:path*",
    dest: "https://aura-get-verified.vercel.app/interface/:path*",
  },
  {
    src: "/core/:path*",
    dest: "https://aura-frontend-new.vercel.app/core/:path*",
  },
  {
    src: "/demo/:path*",
    dest: "https://aura-demo.vercel.app/demo/:path*",
  },
  {
    src: "/docs/:path*",
    dest: "https://aura-docs.vercel.app/docs/:path*",
  },
];

// Insert proxy rewrites BEFORE the filesystem handler so they are matched first
const filesystemIndex = config.routes.findIndex(
  (r) => r.handle === "filesystem"
);

if (filesystemIndex !== -1) {
  config.routes.splice(filesystemIndex, 0, ...proxyRewrites);
} else {
  // Fallback: prepend to routes array
  config.routes.unshift(...proxyRewrites);
}

writeFileSync(configPath, JSON.stringify(config, null, "\t") + "\n");

console.log("✅ Patched .vercel/output/config.json with proxy rewrites");
