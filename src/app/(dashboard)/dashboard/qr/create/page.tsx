"use client";
import { useMemo, useState } from "react";
import { QrPreview } from "@/components/qr/QrPreview";
import { QrTypeSelector } from "@/components/qr/QrTypeSelector";
import { QrContentForm } from "@/components/qr/QrContentForm";
import { QrDesignEditor } from "@/components/qr/QrDesignEditor";
import { QrDownloadModal } from "@/components/qr/QrDownloadModal";

export default function CreateQrPage() {
  const [type, setType] = useState("DYNAMIC_URL");
  const [content, setContent] = useState("https://example.com");
  const [fg, setFg] = useState("#1A3C6E");
  const [bg, setBg] = useState("#FFFFFF");
  const previewValue = useMemo(() => `${type}:${content}`, [type, content]);

  return <div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4 rounded-lg border border-border bg-white p-4"><h1 className="text-2xl font-bold">Wizard de création</h1><QrTypeSelector value={type} onChange={setType} /><QrContentForm value={content} onChange={setContent} /><QrDesignEditor fg={fg} bg={bg} setFg={setFg} setBg={setBg} /><QrDownloadModal /></div><div className="rounded-lg border border-border bg-white p-8"><p className="mb-3 text-sm text-muted">Preview temps réel</p><QrPreview value={previewValue} fg={fg} bg={bg} /></div></div>;
}
