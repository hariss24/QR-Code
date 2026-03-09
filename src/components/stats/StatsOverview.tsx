export function StatsOverview() {
  return <div className="grid gap-4 md:grid-cols-4">{["Total QR Codes", "Scans 30j", "Scans aujourd'hui", "Top QR"].map((s) => <div key={s} className="rounded-lg border border-border bg-white p-4"><p className="text-xs text-muted">{s}</p><p className="text-2xl font-bold">--</p></div>)}</div>;
}
