import { prisma } from "@/lib/prisma";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { ScanChart } from "@/components/stats/ScanChart";
import { DeviceChart } from "@/components/stats/DeviceChart";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalQr, totalScans, scansToday, recentScans, deviceBreakdown] =
    await Promise.all([
      prisma.qrCode.count(),
      prisma.scan.count(),
      prisma.scan.count({ where: { scannedAt: { gte: today } } }),
      prisma.scan.findMany({
        where: { scannedAt: { gte: thirtyDaysAgo } },
        select: { scannedAt: true },
        orderBy: { scannedAt: "desc" },
      }),
      prisma.scan.groupBy({
        by: ["device"],
        _count: true,
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

  const devices = deviceBreakdown.map((d) => ({
    name: d.device ?? "unknown",
    value: d._count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsOverview
        totalQr={totalQr}
        totalScans={totalScans}
        scansToday={scansToday}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScanChart data={daily} />
        </div>
        <DeviceChart data={devices} />
      </div>
    </div>
  );
}
