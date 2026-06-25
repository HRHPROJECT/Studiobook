/** Données de démo pour la messagerie (statique, côté client). */
export type Conversation = {
  id: string;
  studioId: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  thread: { from: "studio" | "me"; text: string; time: string }[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    studioId: "studio-lumiere",
    name: "Studio Lumière",
    initials: "SL",
    preview: "Parfait, à mercredi 15h !",
    time: "9:24",
    unread: 2,
    thread: [
      { from: "me", text: "Bonjour, le piano est bien accordé ?", time: "9:02" },
      { from: "studio", text: "Bonjour ! Oui, accordé la semaine dernière.", time: "9:10" },
      { from: "me", text: "Super, je réserve mercredi 15h.", time: "9:20" },
      { from: "studio", text: "Parfait, à mercredi 15h !", time: "9:24" },
    ],
  },
  {
    id: "c2",
    studioId: "atelier-sonore",
    name: "Atelier Sonore",
    initials: "AS",
    preview: "Le micro Neumann sera dispo 👍",
    time: "Hier",
    unread: 0,
    thread: [
      { from: "me", text: "Le Neumann TLM 102 est dispo samedi ?", time: "Hier" },
      { from: "studio", text: "Le micro Neumann sera dispo 👍", time: "Hier" },
    ],
  },
  {
    id: "c3",
    studioId: "studio-mistral",
    name: "Studio Mistral",
    initials: "SM",
    preview: "Merci pour votre réservation !",
    time: "Lun",
    unread: 0,
    thread: [
      { from: "studio", text: "Merci pour votre réservation !", time: "Lun" },
    ],
  },
];

export const getConversation = (id: string) => CONVERSATIONS.find((c) => c.id === id);
