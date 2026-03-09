import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrBuffer } from "@/lib/qr-generator";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { id: params.id } });
  const payload = qr?.content as { url?: string; text?: string } | null;
  const text = payload?.url ?? payload?.text ?? "https://example.com";
  const buffer = await generateQrBuffer(text);
  return new NextResponse(buffer, { headers: { "Content-Type": "image/png" } });
}
