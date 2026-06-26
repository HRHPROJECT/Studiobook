import { all, get, run } from "./db";

export type ConversationSummary = {
  id: number;
  studioId: string;
  otherName: string;
  lastMessage: string;
  lastAt: number;
  unread: number;
};

/** Crée (ou retrouve) la conversation entre un client et l'hôte d'un studio. */
export async function startConversation(clientId: number, studioId: string, bookingRef?: string): Promise<number | null> {
  const studio = await get<{ owner_id: number | null; name: string }>("SELECT owner_id, name FROM studios WHERE id = ?", [studioId]);
  if (!studio || studio.owner_id == null) return null;
  const hostId = Number(studio.owner_id);
  if (hostId === clientId) return null; // on ne se contacte pas soi-même

  let conv = await get<{ id: number }>("SELECT id FROM conversations WHERE client_id = ? AND studio_id = ?", [clientId, studioId]);
  if (!conv) {
    const now = Date.now();
    const info = await run(
      "INSERT INTO conversations (client_id, host_id, studio_id, booking_ref, created_at, updated_at) VALUES (?,?,?,?,?,?)",
      [clientId, hostId, studioId, bookingRef ?? null, now, now]
    );
    return Number(info.lastInsertRowid);
  }
  return Number(conv.id);
}

/** Liste des conversations d'un utilisateur (client OU hôte), avec dernier message et non-lus. */
export async function listConversations(userId: number): Promise<ConversationSummary[]> {
  const convs = await all<{ id: number; client_id: number; host_id: number; studio_id: string }>(
    "SELECT id, client_id, host_id, studio_id FROM conversations WHERE client_id = ? OR host_id = ? ORDER BY updated_at DESC",
    [userId, userId]
  );

  const out: ConversationSummary[] = [];
  for (const c of convs) {
    const isHost = Number(c.host_id) === userId;
    const otherId = isHost ? Number(c.client_id) : Number(c.host_id);
    let otherName: string;
    if (isHost) {
      const u = await get<{ name: string }>("SELECT name FROM users WHERE id = ?", [otherId]);
      otherName = u?.name ?? "Client";
    } else {
      const s = await get<{ name: string }>("SELECT name FROM studios WHERE id = ?", [c.studio_id]);
      otherName = s?.name ?? "Studio";
    }
    const last = await get<{ body: string; created_at: number }>(
      "SELECT body, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1",
      [c.id]
    );
    const unread = await get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND sender_id <> ? AND read_at IS NULL",
      [c.id, userId]
    );
    out.push({
      id: Number(c.id),
      studioId: c.studio_id,
      otherName,
      lastMessage: last?.body ?? "Nouvelle conversation",
      lastAt: Number(last?.created_at ?? 0),
      unread: Number(unread?.n ?? 0),
    });
  }
  return out;
}

async function participantInfo(convId: number, userId: number) {
  const c = await get<{ id: number; client_id: number; host_id: number; studio_id: string }>(
    "SELECT id, client_id, host_id, studio_id FROM conversations WHERE id = ?",
    [convId]
  );
  if (!c) return null;
  if (Number(c.client_id) !== userId && Number(c.host_id) !== userId) return null; // pas participant
  return c;
}

/** Messages d'une conversation (réservée aux participants) + marque comme lus. */
export async function getThread(convId: number, userId: number) {
  const c = await participantInfo(convId, userId);
  if (!c) return null;

  const isHost = Number(c.host_id) === userId;
  let title: string;
  if (isHost) {
    const u = await get<{ name: string }>("SELECT name FROM users WHERE id = ?", [Number(c.client_id)]);
    title = u?.name ?? "Client";
  } else {
    const s = await get<{ name: string }>("SELECT name FROM studios WHERE id = ?", [c.studio_id]);
    title = s?.name ?? "Studio";
  }

  const messages = await all<{ id: number; sender_id: number; body: string; created_at: number }>(
    "SELECT id, sender_id, body, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at",
    [convId]
  );
  await run("UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id <> ? AND read_at IS NULL", [Date.now(), convId, userId]);

  return {
    title,
    studioId: c.studio_id,
    messages: messages.map((m) => ({ id: Number(m.id), mine: Number(m.sender_id) === userId, body: m.body, at: Number(m.created_at) })),
  };
}

/** Envoie un message (réservé aux participants). */
export async function sendMessage(convId: number, userId: number, body: string): Promise<boolean> {
  const c = await participantInfo(convId, userId);
  if (!c) return false;
  const text = body.trim().slice(0, 2000);
  if (!text) return false;
  const now = Date.now();
  await run("INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES (?,?,?,?)", [convId, userId, text, now]);
  await run("UPDATE conversations SET updated_at = ? WHERE id = ?", [now, convId]);
  return true;
}
