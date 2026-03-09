"use client";

interface Props {
  fg: string;
  bg: string;
  setFg: (v: string) => void;
  setBg: (v: string) => void;
}

export function QrDesignEditor({ fg, bg, setFg, setBg }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Couleurs</p>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-border"
          />
          Premier plan
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-border"
          />
          Arrière-plan
        </label>
      </div>
    </div>
  );
}
