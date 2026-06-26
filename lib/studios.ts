import type { LucideIcon } from "lucide-react";
import { Mic, Camera, Podcast, Video, Drama } from "lucide-react";

export type Discipline = "musique" | "podcast" | "photo" | "video" | "danse";

export type Studio = {
  id: string;
  name: string;
  discipline: Discipline;            // primaire (filtrage + seed)
  disciplines: Discipline[];         // toutes (affichage)
  city: string;
  district: string;
  distanceKm: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  topHost: boolean;
  availableToday: boolean;
  metro: string;
  address: string;
  description: string;
  equipment: string[];
  accessPMR: boolean;
  openWeekend: boolean;
  reviews: { author: string; rating: number; date: string; text: string }[];
};

export const DISCIPLINES: {
  id: Discipline;
  label: string;
  Icon: LucideIcon;
  grad: string;
}[] = [
  { id: "musique", label: "Musique", Icon: Mic, grad: "grad-musique" },
  { id: "podcast", label: "Podcast", Icon: Podcast, grad: "grad-podcast" },
  { id: "photo", label: "Photo", Icon: Camera, grad: "grad-photo" },
  { id: "video", label: "Vidéo", Icon: Video, grad: "grad-video" },
  { id: "danse", label: "Danse", Icon: Drama, grad: "grad-danse" },
];

export const iconFor = (d: Discipline): LucideIcon =>
  DISCIPLINES.find((x) => x.id === d)?.Icon ?? Mic;
export const gradFor = (d: Discipline) =>
  DISCIPLINES.find((x) => x.id === d)?.grad ?? "grad-musique";
export const labelFor = (d: Discipline) =>
  DISCIPLINES.find((x) => x.id === d)?.label ?? d;
export const disciplinesLabel = (s: { disciplines: Discipline[] }) =>
  s.disciplines.map(labelFor).join(", ");

/** Forme légère utilisée par les cartes (compatible avec les données DB). */
export type StudioSummary = {
  id: string;
  name: string;
  discipline: Discipline;
  disciplines: Discipline[];
  city: string;
  district: string;
  distanceKm: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  topHost: boolean;
  availableToday: boolean;
};

export const STUDIOS: Studio[] = [
  {
    id: "studio-lumiere",
    name: "Studio Lumière",
    discipline: "musique",
    disciplines: ["musique", "podcast"],
    city: "Paris",
    district: "Paris 11e",
    distanceKm: 1.2,
    pricePerHour: 45,
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    topHost: true,
    availableToday: true,
    metro: "Métro Oberkampf — 3 min",
    address: "12 rue Oberkampf, 75011 Paris",
    description:
      "Studio acoustique de 35 m² en plein cœur du 11e. Cabine traitée, lumière naturelle et matériel haut de gamme. Idéal enregistrement, podcast et répétitions.",
    equipment: ["Piano à queue", "Console analogique", "Casques ×4", "Climatisation", "Wi-Fi fibre"],
    accessPMR: true,
    openWeekend: true,
    reviews: [
      { author: "Léa M.", rating: 5, date: "il y a 3 sem.", text: "Acoustique top, accueil parfait. Je reviendrai sans hésiter." },
      { author: "Karim B.", rating: 5, date: "il y a 1 mois", text: "Matériel haut de gamme, cabine vraiment bien traitée." },
      { author: "Inès D.", rating: 4, date: "il y a 2 mois", text: "Super studio, un peu difficile à trouver la première fois." },
    ],
  },
  {
    id: "atelier-sonore",
    name: "Atelier Sonore",
    discipline: "musique",
    disciplines: ["musique"],
    city: "Paris",
    district: "Paris 10e",
    distanceKm: 2.4,
    pricePerHour: 38,
    rating: 4.7,
    reviewCount: 86,
    verified: true,
    topHost: false,
    availableToday: true,
    metro: "Métro Gare de l'Est — 5 min",
    address: "9 rue des Récollets, 75010 Paris",
    description:
      "Studio de répétition et d'enregistrement chaleureux, backline complet et cabine voix. Parfait pour groupes et projets solo.",
    equipment: ["Micro Neumann TLM 102", "Backline complet", "Batterie Pearl", "Pro Tools", "Cabine voix"],
    accessPMR: false,
    openWeekend: true,
    reviews: [
      { author: "Maxime L.", rating: 5, date: "il y a 5 j.", text: "Le micro Neumann est une tuerie. Setup prêt en 5 min." },
      { author: "Clara P.", rating: 4, date: "il y a 1 mois", text: "Très bien insonorisé, juste l'accès PMR qui manque." },
    ],
  },
  {
    id: "studio-mistral",
    name: "Studio Mistral",
    discipline: "photo",
    disciplines: ["photo", "video"],
    city: "Montreuil",
    district: "Montreuil",
    distanceKm: 4.1,
    pricePerHour: 52,
    rating: 4.8,
    reviewCount: 203,
    verified: true,
    topHost: true,
    availableToday: false,
    metro: "Métro Croix de Chavaux — 4 min",
    address: "30 rue de Paris, 93100 Montreuil",
    description:
      "Studio photo & vidéo de 90 m² avec cyclorama blanc, parc de flashs Profoto et lumière naturelle plein nord. Loge maquillage incluse.",
    equipment: ["Cyclorama blanc 6 m", "3 flashs Profoto B10", "Fond chroma vert", "Lumière naturelle", "Loge maquillage"],
    accessPMR: true,
    openWeekend: true,
    reviews: [
      { author: "Sofia R.", rating: 5, date: "il y a 1 sem.", text: "Lumière incroyable, matériel nickel. Shooting parfait." },
      { author: "Tom V.", rating: 5, date: "il y a 3 sem.", text: "Le cyclo est immense, idéal pour la vidéo aussi." },
    ],
  },
  {
    id: "podcast-corner",
    name: "Podcast Corner",
    discipline: "podcast",
    disciplines: ["podcast", "video"],
    city: "Paris",
    district: "Paris 2e",
    distanceKm: 0.8,
    pricePerHour: 28,
    rating: 4.7,
    reviewCount: 33,
    verified: true,
    topHost: false,
    availableToday: true,
    metro: "Métro Sentier — 1 min",
    address: "24 rue du Caire, 75002 Paris",
    description:
      "Studio podcast clé en main : 4 micros Shure SM7B, RodeCaster Pro II et traitement acoustique complet. Captation vidéo 4K possible.",
    equipment: ["4× Shure SM7B", "RodeCaster Pro II", "Casques monitoring", "Caméra 4K + éclairage", "Wi-Fi très haut débit"],
    accessPMR: false,
    openWeekend: false,
    reviews: [
      { author: "Maxime L.", rating: 5, date: "il y a 5 j.", text: "Setup pro, prêt à enregistrer en 5 min." },
      { author: "Clara P.", rating: 4, date: "il y a 1 mois", text: "Très bien insonorisé, idéal pour mon émission." },
    ],
  },
  {
    id: "studio-cadrage",
    name: "Studio Cadrage",
    discipline: "video",
    disciplines: ["video", "photo"],
    city: "Paris",
    district: "Paris 18e",
    distanceKm: 3.4,
    pricePerHour: 60,
    rating: 4.8,
    reviewCount: 54,
    verified: true,
    topHost: true,
    availableToday: false,
    metro: "Métro Marcadet — 2 min",
    address: "8 rue Ordener, 75018 Paris",
    description:
      "Plateau vidéo de 120 m² : fond vert, travelling, kit lumière LED et régie. Idéal clips, interviews et contenus réseaux.",
    equipment: ["Fond vert 8 m", "Kit LED Aputure", "Travelling + slider", "Régie multicam", "Loge + maquillage"],
    accessPMR: true,
    openWeekend: false,
    reviews: [
      { author: "Dylan R.", rating: 5, date: "il y a 1 sem.", text: "Plateau immense, lumière au top pour mes clips." },
    ],
  },
  {
    id: "studio-mouvement",
    name: "Studio Mouvement",
    discipline: "danse",
    disciplines: ["danse"],
    city: "Lyon",
    district: "Lyon 7e",
    distanceKm: 2.1,
    pricePerHour: 22,
    rating: 4.6,
    reviewCount: 19,
    verified: true,
    topHost: false,
    availableToday: true,
    metro: "Métro Jean Macé — 3 min",
    address: "15 rue de l'Université, 69007 Lyon",
    description:
      "Salle de danse de 120 m² avec parquet bois, mur de miroirs et sono Bluetooth. Idéal répétition, cours et captation chorégraphique.",
    equipment: ["Parquet danse 120 m²", "Mur de miroirs", "Sono Bluetooth", "Barres amovibles", "Vestiaires + douches"],
    accessPMR: true,
    openWeekend: true,
    reviews: [
      { author: "Naïma K.", rating: 5, date: "il y a 2 sem.", text: "Grand, lumineux, parquet impeccable." },
      { author: "Hugo T.", rating: 4, date: "il y a 1 mois", text: "Bon rapport qualité-prix, sono un peu juste." },
    ],
  },
  {
    id: "blue-note",
    name: "Blue Note Studio",
    discipline: "musique",
    disciplines: ["musique"],
    city: "Marseille",
    district: "Marseille 1er",
    distanceKm: 0.9,
    pricePerHour: 38,
    rating: 4.9,
    reviewCount: 36,
    verified: true,
    topHost: true,
    availableToday: true,
    metro: "Métro Vieux-Port — 3 min",
    address: "7 rue de la République, 13001 Marseille",
    description:
      "Studio d'enregistrement haut de gamme face au Vieux-Port. Régie SSL, cabine grand format et large choix de micros vintage.",
    equipment: ["Console SSL", "Cabine grand format", "Micros vintage Neumann", "Mastering sur demande", "Climatisation"],
    accessPMR: true,
    openWeekend: true,
    reviews: [
      { author: "Yanis M.", rating: 5, date: "il y a 4 j.", text: "Le meilleur studio de Marseille, son énorme." },
      { author: "Chloé B.", rating: 5, date: "il y a 2 sem.", text: "Régie de rêve, accueil parfait." },
    ],
  },
  {
    id: "flash-studio",
    name: "Flash Studio",
    discipline: "photo",
    disciplines: ["photo"],
    city: "Lyon",
    district: "Lyon 6e",
    distanceKm: 3.0,
    pricePerHour: 40,
    rating: 4.6,
    reviewCount: 18,
    verified: true,
    topHost: false,
    availableToday: false,
    metro: "Métro Foch — 2 min",
    address: "20 rue Bossuet, 69006 Lyon",
    description:
      "Studio photo polyvalent : fonds interchangeables, flashs Godox et coin packshot. Adapté portrait, produit et contenu social.",
    equipment: ["5 fonds colorés", "Flashs Godox AD600", "Table packshot", "Réflecteurs + softbox", "Wi-Fi haut débit"],
    accessPMR: true,
    openWeekend: false,
    reviews: [
      { author: "Dylan R.", rating: 5, date: "il y a 1 sem.", text: "Parfait pour mes shootings produit, matériel complet." },
    ],
  },
];

export const getStudio = (id: string) => STUDIOS.find((s) => s.id === id);

export type SearchFilters = {
  query?: string;
  discipline?: Discipline | "all";
  city?: string;
  maxPrice?: number;
  weekendOnly?: boolean;
  pmrOnly?: boolean;
};

export function searchStudios(f: SearchFilters): Studio[] {
  return STUDIOS.filter((s) => {
    if (f.discipline && f.discipline !== "all" && !s.disciplines.includes(f.discipline)) return false;
    if (f.city && s.city !== f.city) return false;
    if (f.maxPrice && s.pricePerHour > f.maxPrice) return false;
    if (f.weekendOnly && !s.openWeekend) return false;
    if (f.pmrOnly && !s.accessPMR) return false;
    if (f.query) {
      const q = f.query.toLowerCase();
      const hay = `${s.name} ${s.district} ${s.city} ${disciplinesLabel(s)} ${s.equipment.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
