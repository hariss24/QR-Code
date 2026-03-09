import { DeviceChart } from "@/components/stats/DeviceChart";
import { GeoMap } from "@/components/stats/GeoMap";

export default function QrStatsPage({ params }: { params: { id: string } }) {
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Stats QR {params.id}</h1><DeviceChart /><GeoMap /></div>;
}
