import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-5xl font-bold text-primary">Créez et pilotez vos QR Codes</h1>
        <p className="mt-4 max-w-2xl text-muted">Plateforme interne inspirée de qr-code-generator.com avec analytics, QR dynamiques, dossiers, bulk et redirections trackées.</p>
        <div className="mt-8 flex gap-3"><Link href="/signup" className="rounded-lg bg-primary px-5 py-3 text-white">Essai gratuit</Link><Link href="/pricing" className="rounded-lg border border-border px-5 py-3">Voir les plans</Link></div>
      </section>
      <Footer />
    </main>
  );
}
