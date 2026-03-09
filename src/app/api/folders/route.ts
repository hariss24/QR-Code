import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const folders = await prisma.folder.findMany({ include: { _count: { select: { qrCodes: true } } } });
  return NextResponse.json({ folders });
}
