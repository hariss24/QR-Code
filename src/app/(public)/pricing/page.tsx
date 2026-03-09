export default function PricingPage() {
  return <main className="mx-auto grid max-w-6xl gap-4 p-8 md:grid-cols-4">{["FREE","STARTER","ADVANCED","PRO"].map((p)=><div key={p} className="rounded-lg border border-border bg-white p-4"><h2 className="font-bold">{p}</h2><p className="text-sm text-muted">Plan {p}</p></div>)}</main>;
}
