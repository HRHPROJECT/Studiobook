import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudioBook — Trouve ton studio créatif",
    short_name: "StudioBook",
    description:
      "Réservez un studio créatif à l'heure partout en France : musique, podcast, photo, vidéo, danse.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101827",
    theme_color: "#101827",
    lang: "fr",
    categories: ["lifestyle", "music", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
