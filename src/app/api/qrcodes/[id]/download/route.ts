import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrPng, generateQrSvg } from "@/lib/qr-generator";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { id: params.id } });
  if (!qr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const searchParams = new URL(request.url).searchParams;
  const format = searchParams.get("format") ?? "png";
  const size = Math.min(Number(searchParams.get("size") ?? 1024), 4096);

  const origin = new URL(request.url).origin;
  const redirectUrl = `${origin}/r/${qr.shortCode}`;
  const opts = {
    foregroundColor: qr.foregroundColor,
    backgroundColor: qr.backgroundColor,
    width: size,
  };

  const safeName = qr.name.replace(/[^a-zA-Z0-9-_]/g, "_");

  if (format === "svg") {
    const svg = await generateQrSvg(redirectUrl, opts);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${safeName}.svg"`,
      },
    });
  }

  const buffer = await generateQrPng(redirectUrl, opts);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${safeName}.png"`,
    },
  });
}
