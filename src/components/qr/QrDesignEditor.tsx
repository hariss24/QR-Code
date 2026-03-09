"use client";

export function QrDesignEditor({ fg, bg, setFg, setBg }: { fg: string; bg: string; setFg: (v: string) => void; setBg: (v: string) => void }) {
  return <div className="grid grid-cols-2 gap-4"><label className="text-sm">Foreground<input aria-label="foreground" type="color" value={fg} onChange={(e)=>setFg(e.target.value)} /></label><label className="text-sm">Background<input aria-label="background" type="color" value={bg} onChange={(e)=>setBg(e.target.value)} /></label></div>;
}
