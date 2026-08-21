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

config.routes = config.routes.filter((route) => {
  if (route.dest && route.dest.includes("/![-]/catchall")) return false;
  if (route.src && route.src.includes("__data.json")) return false;
  if (route.src && route.src.includes("_app/immutable")) return false;
  if (route.handle === "filesystem") return false;
  if (route.dest === "/index.html") return false;
  return true;
});

const proxyRoutes = [
  {
    src: "/dashboard(/.*)?",
    dest: "https://aura-dashboard-rust.vercel.app/dashboard$1",
  },
  {
    src: "^/interface/?$",
    status: 307,
    headers: { Location: "/interface/login" },
  },
  {
    src: "/interface(/.*)?",
    dest: "https://aura-get-verified.vercel.app/interface$1",
  },
  {
    src: "/core(/.*)?",
    dest: "https://aura-frontend-new.vercel.app/core$1",
  },
  {
    src: "/demo(/.*)?",
    dest: "https://aura-demo.vercel.app/demo$1",
  },
  {
    src: "/docs(/.*)?",
    dest: "https://aura-docs.vercel.app/docs$1",
  },
  {
    src: "^/login(/.*)?$",
    dest: "https://aura-dashboard-rust.vercel.app/login$1",
  },
  {
    src: "^/onboarding(/.*)?$",
    dest: "https://aura-dashboard-rust.vercel.app/onboarding$1",
  },
  {
    src: "/assets/(.*)",
    dest: "https://aura-dashboard-rust.vercel.app/assets/$1",
  },
  {
    src: "/images/(.*)",
    dest: "https://aura-dashboard-rust.vercel.app/images/$1",
  },
];

config.routes.unshift(...proxyRoutes);
config.routes.push({
  src: "/((?!l/).*)",
  dest: "/index.html",
});

writeFileSync(configPath, JSON.stringify(config, null, "\t") + "\n");

console.log("✅ Patched .vercel/output/config.json with proxy routes");
