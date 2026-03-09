import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BarChart3, Download, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QrDetailPage({ params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({
    where: { id: params.id },
    include: { _count: { select: { scans: true } } },
  });
  if (!qr) notFound();

  const payload = qr.content as { url?: string };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/qrcodes" className="rounded p-1 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">{qr.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Preview */}
        <div className="flex flex-col items-center rounded-lg border border-border bg-white p-8">
          <Image
            src={`/api/qrcodes/${qr.id}/download?format=png&size=300`}
            alt={qr.name}
            width={300}
            height={300}
            unoptimized
          />
          <div className="mt-6 flex gap-3">
            <a
              href={`/api/qrcodes/${qr.id}/download?format=png`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              <Download size={14} /> PNG
            </a>
            <a
              href={`/api/qrcodes/${qr.id}/download?format=svg`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              <Download size={14} /> SVG
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 rounded-lg border border-border bg-white p-6">
          <div>
            <p className="text-sm text-muted">URL de destination</p>
            <p className="font-medium">{payload?.url}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Short code</p>
            <p className="font-mono text-sm">{qr.shortCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Scans</p>
            <p className="text-2xl font-bold">{qr._count.scans}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Créé le</p>
            <p>{new Date(qr.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href={`/dashboard/qr/${qr.id}/stats`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <BarChart3 size={14} /> Voir les stats
            </Link>
            <a
              href={`/r/${qr.shortCode}`}
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <ExternalLink size={14} /> Tester
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
