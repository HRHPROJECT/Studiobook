import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { get, run } from "./db";

const COOKIE = "sb_session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export type Role = "client" | "host" | "both" | "admin";
export type SessionUser = { id: number; name: string; email: string; role: Role };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, "hex");
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  const expires = now + SESSION_MS;
  await run("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)", [token, userId, now, expires]);
  return { token, expires };
}

export async function setSessionCookie(token: string, expires: number) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires),
  });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token = ?", [token]);
  store.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const row = await get<{ id: number; name: string; email: string; role: Role; expires_at: number }>(
    `SELECT u.id AS id, u.name AS name, u.email AS email, u.role AS role, s.expires_at AS expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
    [token]
  );
  if (!row) return null;
  if (Number(row.expires_at) < Date.now()) {
    await run("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  return { id: Number(row.id), name: row.name, email: row.email, role: (row.role ?? "client") as Role };
}

/* Helpers d'autorisation ------------------------------------------------- */

export const hasHostAccess = (u: { role: Role } | null) => !!u && (u.role === "host" || u.role === "both" || u.role === "admin");
export const hasClientAccess = (u: { role: Role } | null) => !!u && (u.role === "client" || u.role === "both" || u.role === "admin");

/** Renvoie l'utilisateur courant ou null. (Les routes décident du code 401.) */
export async function requireAuth(): Promise<SessionUser | null> {
  return getCurrentUser();
}

/** true si l'utilisateur est propriétaire du studio donné. */
export async function isStudioOwner(userId: number, studioId: string): Promise<boolean> {
  const row = await get<{ owner_id: number | null }>("SELECT owner_id FROM studios WHERE id = ?", [studioId]);
  return !!row && Number(row.owner_id) === userId;
}
