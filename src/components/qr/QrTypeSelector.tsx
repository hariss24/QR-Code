"use client";
const types = ["DYNAMIC_URL", "PDF", "VCARD_PLUS", "SOCIAL_MEDIA", "EVENT", "COUPON", "STATIC_URL", "PLAIN_TEXT", "EMAIL", "SMS", "WIFI"];

export function QrTypeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{types.map((type) => <button key={type} onClick={() => onChange(type)} className={`rounded-lg border p-2 text-xs ${value === type ? "border-primary bg-blue-50" : "border-border"}`}>{type}</button>)}</div>;
}
