"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import clsx from "clsx";

type Thread = { title: string; studioId: string; messages: { id: number; mine: boolean; body: string; at: number }[] };

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [text, setText] = useState("");
  const [notFound, setNotFound] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/conversations/${id}`);
    if (r.status === 404 || r.status === 401) { setNotFound(true); return; }
    setThread(await r.json());
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // rafraîchissement léger
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread?.messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    await fetch(`/api/conversations/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    load();
  };

  if (notFound) {
    return (
      <div className="p-10 text-center">
        <p className="font-bold text-ink">Conversation introuvable</p>
        <button onClick={() => router.push("/messages")} className="mt-3 text-sm font-semibold text-gold-dark">Retour aux messages</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft size={22} />
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-accent">
          {(thread?.title ?? "··").slice(0, 2).toUpperCase()}
        </span>
        <h1 className="text-base font-bold text-ink">{thread?.title ?? "Conversation"}</h1>
      </header>

      <div className="flex-1 space-y-2.5 px-5 py-5">
        {thread?.messages.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted">Démarre la conversation ci-dessous.</p>
        )}
        {thread?.messages.map((m) => (
          <div key={m.id} className={clsx("flex", m.mine ? "justify-end" : "justify-start")}>
            <div className={clsx("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[15px]", m.mine ? "bg-brand text-white" : "border border-line bg-white text-ink")}>
              {m.body}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-white px-4 py-3">
        <label htmlFor="msg" className="sr-only">Message</label>
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris un message…"
          className="min-h-[44px] flex-1 rounded-2xl border border-greige bg-surface px-4 text-[15px] outline-none focus:border-brand" />
        <button type="submit" aria-label="Envoyer" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-brand">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
