"use client";
import { Input } from "@/components/ui/input";

interface Props {
  name: string;
  url: string;
  onNameChange: (v: string) => void;
  onUrlChange: (v: string) => void;
}

export function QrContentForm({ name, url, onNameChange, onUrlChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nom du QR Code</label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Flyer Mars 2026"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">URL de destination</label>
        <Input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://monsite.com"
          type="url"
        />
      </div>
    </div>
  );
}
