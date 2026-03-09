import { QrCode, ScanLine, TrendingUp } from "lucide-react";

interface Props {
  totalQr: number;
  totalScans: number;
  scansToday: number;
}

export function StatsOverview({ totalQr, totalScans, scansToday }: Props) {
  const stats = [
    { label: "QR Codes", value: totalQr, icon: QrCode },
    { label: "Scans total", value: totalScans, icon: ScanLine },
    { label: "Scans aujourd'hui", value: scansToday, icon: TrendingUp },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-lg border border-border bg-white p-4"
        >
          <div className="rounded-lg bg-blue-50 p-2.5">
            <Icon size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
