"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrPreview } from "@/components/qr/QrPreview";
import { QrContentForm } from "@/components/qr/QrContentForm";
import { QrDesignEditor } from "@/components/qr/QrDesignEditor";
import { QrDownloadModal } from "@/components/qr/QrDownloadModal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CreateQrPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#FFFFFF");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && url.startsWith("http");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, foregroundColor: fg, backgroundColor: bg }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.toString() ?? "Erreur");
      }
      const created = await res.json();
      setSavedId(created.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Créer un QR Code</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-lg border border-border bg-white p-6">
          <QrContentForm
            name={name}
            url={url}
            onNameChange={setName}
            onUrlChange={setUrl}
          />
          <QrDesignEditor fg={fg} bg={bg} setFg={setFg} setBg={setBg} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            {!savedId ? (
              <Button onClick={handleSave} disabled={!canSave || saving}>
                {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
                {saving ? "Création..." : "Créer le QR Code"}
              </Button>
            ) : (
              <>
                <QrDownloadModal qrId={savedId} qrName={name} />
                <Button
                  onClick={() => router.push("/dashboard/qrcodes")}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Voir mes QR Codes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-white p-6">
            <p className="mb-3 text-sm text-muted">Aperçu en temps réel</p>
            <QrPreview value={url} fg={fg} bg={bg} />
          </div>
          {savedId && (
            <p className="text-center text-sm text-green-600">
              QR Code créé avec succès
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
