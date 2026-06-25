import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app. A stray package-lock.json in the parent
  // folder (C:\Users\rhlal) otherwise makes Turbopack infer the wrong root and
  // breaks the React Client Manifest resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Keep the native SQLite module out of the bundle (runs only in Node route handlers).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
