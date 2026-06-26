import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getThread, sendMessage } from "@/lib/server/messaging";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const thread = await getThread(Number(id), user.id);
  if (!thread) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  return NextResponse.json(thread);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const ok = await sendMessage(Number(id), user.id, String(body.body ?? ""));
  if (!ok) return NextResponse.json({ error: "Envoi impossible." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
