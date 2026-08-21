#!/usr/bin/env node

/**
 * Postbuild script: injects proxy rewrites into .vercel/output/config.json
 *
 * Ensures proxy rewrites are matched before the SPA fallback.
 * Cleans up any stale SvelteKit-specific routes.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const configPath = resolve(
  import.meta.dirname,
  "..",
  ".vercel",
  "output",
  "config.json",
);

const config = JSON.parse(readFileSync(configPath, "utf-8"));

// Remove stale SvelteKit-specific routes
config.routes = config.routes.filter((route) => {
  // Remove SvelteKit catch-all function routes
  if (route.dest && route.dest.includes("/![-]/catchall")) return false;
  // Remove __data.json routes
  if (route.src && route.src.includes("__data.json")) return false;
  // Remove _app/immutable cache routes
  if (route.src && route.src.includes("_app/immutable")) return false;
  return true;
});

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
  (r) => r.handle === "filesystem",
);

if (filesystemIndex !== -1) {
  config.routes.splice(filesystemIndex, 0, ...proxyRewrites);
} else {
  // Fallback: prepend to routes array
  config.routes.unshift(...proxyRewrites);
}

// Ensure there is a SPA fallback as the very last route
const lastRoute = config.routes[config.routes.length - 1];
if (!lastRoute || lastRoute.dest !== "/index.html") {
  config.routes.push({
    src: "/.*",
    dest: "/index.html",
  });
}

writeFileSync(configPath, JSON.stringify(config, null, "\t") + "\n");

console.log("✅ Patched .vercel/output/config.json with proxy rewrites");
