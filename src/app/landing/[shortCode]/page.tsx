import { prisma } from "@/lib/prisma";

export default async function DynamicLandingPage({ params }: { params: { shortCode: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { shortCode: params.shortCode } });
  return <main className="mx-auto max-w-xl p-6"><div className="rounded-lg border border-border bg-white p-6"><h1 className="text-xl font-bold">Landing dynamique</h1><pre className="mt-3 text-xs">{JSON.stringify(qr?.content, null, 2)}</pre><p className="mt-4 text-xs text-muted">Powered by QRGen Internal</p></div></main>;
}
