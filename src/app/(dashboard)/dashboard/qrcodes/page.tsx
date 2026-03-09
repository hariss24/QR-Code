import { QrTable } from "@/components/qr/QrTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function QrCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes QR Codes</h1>
        <Link
          href="/dashboard/qr/create"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
        >
          <Plus size={16} />
          Créer
        </Link>
      </div>
      <QrTable />
    </div>
  );
}
