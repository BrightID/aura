#!/usr/bin/env node

/**
 * Postbuild script: injects proxy routes into .vercel/output/config.json
 *
 * Ensures proxy routes are matched before the SPA fallback.
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

const proxyRoutes = [
  {
    src: "/dashboard/(.*)",
    dest: "https://aura-dashboard-rust.vercel.app/dashboard/$1",
  },
  {
    src: "/interface/(.*)",
    dest: "https://aura-get-verified.vercel.app/interface/$1",
  },
  {
    src: "/core/(.*)",
    dest: "https://aura-frontend-new.vercel.app/core/$1",
  },
  {
    src: "/demo/(.*)",
    dest: "https://aura-demo.vercel.app/demo/$1",
  },
  {
    src: "/docs/(.*)",
    dest: "https://aura-docs.vercel.app/docs/$1",
  },
];

// Insert proxy routes BEFORE the filesystem handler so they are matched first
const filesystemIndex = config.routes.findIndex(
  (r) => r.handle === "filesystem",
);

if (filesystemIndex !== -1) {
  config.routes.splice(filesystemIndex, 0, ...proxyRoutes);
} else {
  // Fallback: prepend to routes array
  config.routes.unshift(...proxyRoutes);
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

console.log("✅ Patched .vercel/output/config.json with proxy routes");
