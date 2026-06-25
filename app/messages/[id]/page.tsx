"use client";

import { use, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { getConversation } from "@/lib/messages";
import clsx from "clsx";

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const conv = getConversation(id);
  const [msgs, setMsgs] = useState(conv?.thread ?? []);
  const [text, setText] = useState("");

  if (!conv) return notFound();

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: text.trim(), time: "maintenant" }]);
    setText("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button onClick={() => router.back()} aria-label="Retour" className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft size={22} />
        </button>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-accent">
          {conv.initials}
        </span>
        <h1 className="text-base font-bold text-ink">{conv.name}</h1>
      </header>

      <div className="flex-1 space-y-2.5 px-5 py-5">
        {msgs.map((m, i) => (
          <div key={i} className={clsx("flex", m.from === "me" ? "justify-end" : "justify-start")}>
            <div
              className={clsx(
                "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[15px]",
                m.from === "me" ? "bg-brand text-white" : "border border-line bg-white text-ink"
              )}
            >
              {m.text}
              <span className={clsx("ml-2 align-bottom text-[10px]", m.from === "me" ? "text-white/50" : "text-muted")}>{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-white px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris un message…"
          aria-label="Message"
          className="min-h-[44px] flex-1 rounded-2xl border border-greige bg-surface px-4 text-[15px] outline-none focus:border-brand"
        />
        <button type="submit" aria-label="Envoyer" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-brand">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
