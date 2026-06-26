import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { listConversations, startConversation } from "@/lib/server/messaging";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ conversations: [] });
  return NextResponse.json({ conversations: await listConversations(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const studioId = String(body.studioId ?? "");
  const id = await startConversation(user.id, studioId, body.bookingRef ? String(body.bookingRef) : undefined);
  if (!id) return NextResponse.json({ error: "Conversation impossible." }, { status: 400 });
  return NextResponse.json({ id });
}
