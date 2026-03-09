import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseScan } from "@/lib/scan-tracker";

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { shortCode: params.shortCode } });
  if (!qr) return NextResponse.redirect(new URL("/dashboard", request.url));

  const scan = parseScan(request.headers);
  await prisma.scan.create({
    data: {
      qrCodeId: qr.id,
      ip: request.headers.get("x-forwarded-for") ?? null,
      userAgent: request.headers.get("user-agent"),
      ...scan,
    },
  });

  const payload = qr.content as { url?: string };
  if (payload?.url) return NextResponse.redirect(payload.url, 302);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
