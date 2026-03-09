"use client";
import Link from "next/link";
import { useQrCodes } from "@/hooks/useQrCodes";
import { QRCodeSVG } from "qrcode.react";
import { BarChart3, Download, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

export function QrTable() {
  const { data, loading, refresh } = useQrCodes();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce QR Code ?")) return;
    setDeleting(id);
    await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
    setDeleting(null);
    refresh();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
        <p className="text-lg font-medium">Aucun QR Code</p>
        <p className="mt-1 text-sm text-muted">Crée ton premier QR Code pour commencer le tracking.</p>
        <Link
          href="/dashboard/qr/create"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm text-white"
        >
          Créer un QR Code
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3">QR Code</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3 text-center">Scans</th>
            <th className="px-4 py-3">Créé le</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((qr) => (
            <tr key={qr.id} className="border-b border-border last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3">
                <QRCodeSVG
                  value={(qr.content as any)?.url ?? "https://example.com"}
                  size={40}
                  fgColor={qr.foregroundColor}
                  bgColor={qr.backgroundColor}
                />
              </td>
              <td className="px-4 py-3 font-medium">
                <Link href={`/dashboard/qr/${qr.id}`} className="hover:text-primary hover:underline">
                  {qr.name}
                </Link>
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                {(qr.content as any)?.url}
              </td>
              <td className="px-4 py-3 text-center font-semibold">
                {qr._count?.scans ?? 0}
              </td>
              <td className="px-4 py-3 text-muted">
                {new Date(qr.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/qr/${qr.id}/stats`}
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Stats"
                  >
                    <BarChart3 size={16} />
                  </Link>
                  <a
                    href={`/api/qrcodes/${qr.id}/download?format=png`}
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Télécharger PNG"
                  >
                    <Download size={16} />
                  </a>
                  <a
                    href={`/r/${qr.shortCode}`}
                    target="_blank"
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Tester le lien"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(qr.id)}
                    disabled={deleting === qr.id}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
