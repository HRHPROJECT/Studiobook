import type { MetadataRoute } from "next";
import { STUDIOS } from "@/lib/studios";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://studiobook.example";
  const routes = ["", "/recherche", "/carte", "/connexion", "/cgv", "/confidentialite", "/mentions-legales", "/accessibilite", "/cookies"];
  const pages = routes.map((r) => ({ url: base + r, changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.6 }));
  const studios = STUDIOS.map((s) => ({ url: `${base}/studio/${s.id}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  return [...pages, ...studios];
}
