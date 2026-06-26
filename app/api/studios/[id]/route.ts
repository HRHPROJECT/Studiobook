import { NextResponse } from "next/server";
import { getPublicStudioDetail } from "@/lib/server/studios";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const studio = await getPublicStudioDetail(id);
  if (!studio) return NextResponse.json({ error: "Studio introuvable." }, { status: 404 });
  return NextResponse.json({ studio });
}
