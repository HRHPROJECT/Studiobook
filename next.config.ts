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
};

export default nextConfig;
