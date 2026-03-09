import Link from "next/link";

export function QrCard({ id, name, type }: { id: string; name: string; type: string }) {
  return <Link href={`/dashboard/qr/${id}`} className="rounded-lg border border-border bg-white p-4 hover:shadow-sm"><p className="font-semibold">{name}</p><p className="text-sm text-muted">{type}</p></Link>;
}
