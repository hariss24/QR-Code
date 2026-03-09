import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const qrCodeId = params.id;

  const [total, byDevice, byOs, byBrowser, recentScans] = await Promise.all([
    prisma.scan.count({ where: { qrCodeId } }),
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.groupBy({
      by: ["os"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.groupBy({
      by: ["browser"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.findMany({
      where: { qrCodeId },
      select: { scannedAt: true },
      orderBy: { scannedAt: "desc" },
      take: 1000,
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (const s of recentScans) {
    const day = s.scannedAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    total,
    byDevice: byDevice.map((d) => ({ name: d.device ?? "unknown", value: d._count })),
    byOs: byOs.map((d) => ({ name: d.os ?? "unknown", value: d._count })),
    byBrowser: byBrowser.map((d) => ({ name: d.browser ?? "unknown", value: d._count })),
    daily,
  });
}
