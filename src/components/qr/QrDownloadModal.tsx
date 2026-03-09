"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface Props {
  qrId: string | null;
  qrName: string;
}

export function QrDownloadModal({ qrId, qrName }: Props) {
  const [open, setOpen] = useState(false);

  if (!qrId) return null;

  const download = (format: "png" | "svg") => {
    const url = `/api/qrcodes/${qrId}/download?format=${format}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${qrName}.${format}`;
    a.click();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Download size={16} />
        Télécharger
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Télécharger le QR Code</h3>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => download("png")}
                className="w-full rounded-lg border border-border px-4 py-3 text-left hover:bg-slate-50"
              >
                <p className="font-medium">PNG</p>
                <p className="text-sm text-muted">Image haute résolution (1024px)</p>
              </button>
              <button
                onClick={() => download("svg")}
                className="w-full rounded-lg border border-border px-4 py-3 text-left hover:bg-slate-50"
              >
                <p className="font-medium">SVG</p>
                <p className="text-sm text-muted">Vectoriel, qualité infinie pour impression</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
