import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScanChart } from "@/components/stats/ScanChart";
import { DeviceChart } from "@/components/stats/DeviceChart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QrStatsPage({ params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({
    where: { id: params.id },
    include: { _count: { select: { scans: true } } },
  });
  if (!qr) notFound();

  const [scans, deviceData] = await Promise.all([
    prisma.scan.findMany({
      where: { qrCodeId: qr.id },
      select: { scannedAt: true },
      orderBy: { scannedAt: "desc" },
      take: 1000,
    }),
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCodeId: qr.id },
      _count: true,
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (const s of scans) {
    const day = s.scannedAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const devices = deviceData.map((d) => ({
    name: d.device ?? "unknown",
    value: d._count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/qrcodes" className="rounded p-1 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{qr.name}</h1>
          <p className="text-sm text-muted">
            {qr._count.scans} scans au total
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScanChart data={daily} />
        </div>
        <DeviceChart data={devices} />
      </div>
    </div>
  );
}
