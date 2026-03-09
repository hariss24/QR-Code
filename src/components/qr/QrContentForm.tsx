"use client";
import { Input } from "@/components/ui/input";

export function QrContentForm({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Contenu</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com" aria-label="Contenu QR" />
    </div>
  );
}
