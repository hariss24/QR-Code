import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const scans = await prisma.scan.findMany({ take: 200, orderBy: { scannedAt: "desc" } });
  return NextResponse.json({ scans });
}
