import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const scans = await prisma.scan.findMany({ where: { qrCodeId: params.id }, take: 500, orderBy: { scannedAt: "desc" } });
  return NextResponse.json({ scans });
}
