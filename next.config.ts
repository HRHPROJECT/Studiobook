import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Épingle la racine du workspace à cette app (évite une mauvaise inférence Turbopack
  // si un package-lock.json traîne dans le dossier parent).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Garde le client libSQL natif hors du bundle (n'est utilisé que dans les route handlers Node).
  serverExternalPackages: ["@libsql/client", "libsql"],
  async headers() {
    const secure = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
    ];
    if (process.env.NODE_ENV === "production") {
      secure.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    }
    return [{ source: "/:path*", headers: secure }];
  },
};

export default nextConfig;
