/** Frais de service StudioBook, ajoutés au total (côté client ET serveur). */
export const SERVICE_FEE = 4.5;

export const euro = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);

export const hourLabel = (h: number) => `${String(h).padStart(2, "0")}h`;

/** Heure courte ou jour pour les listes de messages. */
export function timeAgo(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"][d.getDay()];
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function makeRef() {
  return "SB-" + Math.floor(10000 + Math.random() * 89999);
}

export function makeAccessCode() {
  return String(Math.floor(1000 + Math.random() * 8999));
}

const WEEKDAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function formatDateISO(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** 14 prochains jours à partir d'aujourd'hui */
export function next14Days(): { iso: string; label: string; dow: string; dom: number }[] {
  const out = [];
  const base = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ iso, label: formatDateISO(iso), dow: WEEKDAYS[d.getDay()], dom: d.getDate() });
  }
  return out;
}
