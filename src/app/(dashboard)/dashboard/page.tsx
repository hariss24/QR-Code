import { StatsOverview } from "@/components/stats/StatsOverview";
import { ScanChart } from "@/components/stats/ScanChart";

export default function DashboardHome() {
  return <div className="space-y-4"><StatsOverview /><ScanChart /></div>;
}
