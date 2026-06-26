import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/hote/", "/profil/", "/paiement", "/recapitulatif", "/messages/"],
    },
    sitemap: "https://studiobook.example/sitemap.xml",
  };
}
