"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type BookingDraft = {
  studioId: string;
  studioName: string;
  pricePerHour: number;
  date: string; // ISO yyyy-mm-dd
  startHour: number;
  duration: number;
  ingeSon: boolean;
};

export type Booking = {
  ref: string;
  studioId: string;
  studioName: string;
  date: string;
  startHour: number;
  duration: number;
  ingeSon: boolean;
  total: number;
  accessCode: string;
  status: string;
  createdAt: number;
};

export type Role = "client" | "host" | "both" | "admin";
export type User = { id: number; name: string; email: string; role: Role };
export type AuthResult = { ok: boolean; error?: string; user?: User };

type Ctx = {
  draft: BookingDraft | null;
  setDraft: (d: BookingDraft | null) => void;
  bookings: Booking[];
  createBooking: () => Promise<Booking | null>;
  cancelBooking: (ref: string) => Promise<void>;
  favorites: string[];
  toggleFavorite: (id: string) => Promise<void>;
  user: User | null;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInQuick: (provider: "apple" | "google") => Promise<User | null>;
  signOut: () => Promise<void>;
  ready: boolean;
};

const BookingContext = createContext<Ctx | null>(null);

async function postJSON(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  async function loadUserData() {
    const [favRes, bookRes] = await Promise.all([
      fetch("/api/favorites").then((r) => r.json()).catch(() => ({ favorites: [] })),
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
    ]);
    setFavorites(favRes.favorites ?? []);
    setBookings(bookRes.bookings ?? []);
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        setUser(me.user ?? null);
        await loadUserData();
      } catch {}
      setReady(true);
    })();
  }, []);

  const afterAuth = async (u: User) => {
    setUser(u);
    await loadUserData();
  };

  const signUp = async (name: string, email: string, password: string, role: Role): Promise<AuthResult> => {
    const { ok, data } = await postJSON("/api/auth/signup", { name, email, password, role });
    if (ok) { await afterAuth(data.user); return { ok: true, user: data.user }; }
    return { ok: false, error: data.error ?? "Inscription impossible." };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { ok, data } = await postJSON("/api/auth/login", { email, password });
    if (ok) { await afterAuth(data.user); return { ok: true, user: data.user }; }
    return { ok: false, error: data.error ?? "Connexion impossible." };
  };

  const signInQuick = async (provider: "apple" | "google"): Promise<User | null> => {
    const { ok, data } = await postJSON("/api/auth/quick", { provider });
    if (ok) { await afterAuth(data.user); return data.user as User; }
    return null;
  };

  const signOut = async () => {
    await postJSON("/api/auth/logout");
    setUser(null);
    setFavorites([]);
    setBookings([]);
  };

  const toggleFavorite = async (id: string) => {
    const optimistic = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(optimistic);
    const { ok, data } = await postJSON("/api/favorites", { studioId: id });
    if (ok) setFavorites(data.favorites);
  };

  const createBooking = async (): Promise<Booking | null> => {
    if (!draft) return null;
    const { ok, data } = await postJSON("/api/bookings", draft);
    if (!ok) return null;
    setBookings((prev) => [data.booking, ...prev]);
    setDraft(null);
    return data.booking;
  };

  const cancelBooking = async (ref: string) => {
    setBookings((prev) => prev.map((b) => (b.ref === ref ? { ...b, status: "cancelled_by_client" } : b)));
    await fetch(`/api/bookings/${ref}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <BookingContext.Provider
      value={{
        draft,
        setDraft,
        bookings,
        createBooking,
        cancelBooking,
        favorites,
        toggleFavorite,
        user,
        signUp,
        signIn,
        signInQuick,
        signOut,
        ready,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
