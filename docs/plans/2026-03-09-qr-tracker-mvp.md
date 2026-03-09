# QR Tracker MVP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer le scaffold existant en un outil fonctionnel de création et tracking de QR codes pour flyers freelance, déployé sur Vercel + Supabase.

**Architecture:** Refactoring du scaffold Next.js 14 existant. On garde Prisma + PostgreSQL (migré vers Supabase), on supprime l'auth, on rend chaque composant stubbed fonctionnel. Le QR encode une URL de redirect (`/r/[shortCode]`) qui track le scan puis redirige vers l'URL cible.

**Tech Stack:** Next.js 14, Prisma, Supabase (PostgreSQL), Tailwind CSS, qrcode (server PNG), qrcode.react (client SVG preview), Recharts (graphiques), Vercel (hosting)

---

## Task 1: Nettoyage — Supprimer l'auth et les pages inutiles

**Files:**
- Delete: `src/lib/auth.ts`
- Delete: `src/app/api/auth/[...nextauth]/route.ts`
- Delete: `src/app/(public)/login/page.tsx`
- Delete: `src/app/(public)/signup/page.tsx`
- Delete: `src/app/(public)/pricing/page.tsx`
- Delete: `src/app/(dashboard)/dashboard/settings/billing/page.tsx`
- Delete: `src/app/(dashboard)/dashboard/settings/domains/page.tsx`
- Delete: `src/app/(dashboard)/dashboard/settings/team/page.tsx`
- Delete: `src/app/(dashboard)/dashboard/bulk-create/page.tsx`
- Delete: `src/app/api/qrcodes/bulk/route.ts`
- Delete: `src/app/api/v1/qrcodes/bulk/route.ts` (if exists)
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `package.json`

**Step 1: Supprimer les fichiers auth et pages inutiles**

Supprimer tous les fichiers listés ci-dessus.

**Step 2: Rediriger `/` vers `/dashboard`**

```tsx
// src/app/(public)/page.tsx
import { redirect } from "next/navigation";
export default function HomePage() {
  redirect("/dashboard");
}
```

**Step 3: Simplifier la Sidebar**

```tsx
// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, BarChart3, Settings, Plus } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/qrcodes", label: "QR Codes", icon: QrCode },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-white">
      <div className="p-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          QRGen
        </Link>
      </div>
      <div className="px-4 pb-4">
        <Link
          href="/dashboard/qr/create"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} />
          Créer un QR Code
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive
                  ? "bg-blue-50 font-medium text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 4: Retirer `next-auth` et `bcryptjs` des dépendances**

```bash
npm uninstall next-auth bcryptjs @types/bcryptjs
```

Note : `bcryptjs` est aussi utilisé dans `prisma/seed.ts`. On le garde en devDependency ou on simplifie le seed (voir Task 2).

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove auth, unused pages, simplify sidebar"
```

---

## Task 2: Adapter la DB pour Supabase

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`
- Modify: `.env.example`
- Modify: `package.json` (build script)
- Modify: `docker-compose.yml`

**Step 1: Simplifier le seed (retirer bcrypt)**

```ts
// prisma/seed.ts
import { PrismaClient, QrCodeType } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Single owner user — no auth, no password needed
  const owner = await prisma.user.upsert({
    where: { email: "owner@qrgen.local" },
    create: { email: "owner@qrgen.local", name: "Owner" },
    update: {},
  });

  // Demo QR codes
  const qrs = [];
  const urls = [
    "https://monportfolio.dev",
    "https://monportfolio.dev/projets",
    "https://monportfolio.dev/contact",
    "https://linkedin.com/in/monprofil",
    "https://github.com/monprofil",
  ];
  for (let i = 0; i < urls.length; i++) {
    const qr = await prisma.qrCode.create({
      data: {
        name: `Flyer ${i + 1}`,
        type: QrCodeType.DYNAMIC_URL,
        isDynamic: true,
        shortCode: `flyer${i + 1}`,
        content: { url: urls[i] },
        userId: owner.id,
      },
    });
    qrs.push(qr);
  }

  // Demo scans
  const devices = ["mobile", "desktop", "tablet"];
  const oses = ["iOS", "Android", "Windows", "macOS"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  for (let i = 0; i < 200; i++) {
    await prisma.scan.create({
      data: {
        qrCodeId: qrs[i % qrs.length].id,
        ip: `192.168.1.${i % 255}`,
        device: devices[i % 3],
        os: oses[i % 4],
        browser: browsers[i % 4],
        scannedAt: subDays(new Date(), i % 30),
      },
    });
  }

  console.log(`Seeded: ${owner.email}, ${qrs.length} QR codes, 200 scans`);
}

main().finally(() => prisma.$disconnect());
```

**Step 2: Mettre à jour `.env.example`**

```env
# Local dev (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qrgen"

# Production (Supabase) — remplir avec tes valeurs Supabase
# DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Step 3: Ajouter `prisma generate` au build script**

Dans `package.json`, modifier le script `build` :

```json
"build": "prisma generate && next build"
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: simplify seed, add prisma generate to build"
```

---

## Task 3: Corriger le POST /api/qrcodes — sauvegarder les QR codes

**Files:**
- Modify: `src/app/api/qrcodes/route.ts`

**Step 1: Réécrire la route POST pour utiliser un owner fixe**

```ts
// src/app/api/qrcodes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/short-code";
import { checkRateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  foregroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#000000"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#FFFFFF"),
});

export async function GET() {
  const items = await prisma.qrCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { scans: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get or create the single owner user
  let owner = await prisma.user.findFirst();
  if (!owner) {
    owner = await prisma.user.create({
      data: { email: "owner@qrgen.local", name: "Owner" },
    });
  }

  const { name, url, foregroundColor, backgroundColor } = parsed.data;

  const created = await prisma.qrCode.create({
    data: {
      name,
      type: "DYNAMIC_URL",
      isDynamic: true,
      shortCode: generateShortCode(),
      content: { url },
      foregroundColor,
      backgroundColor,
      userId: owner.id,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
```

**Step 2: Vérifier que le GET inclut le count de scans**

Le `include: { _count: { select: { scans: true } } }` ajoute `_count.scans` à chaque QR retourné. C'est crucial pour le tableau.

**Step 3: Commit**

```bash
git add src/app/api/qrcodes/route.ts
git commit -m "fix: POST /api/qrcodes saves to DB with owner user"
```

---

## Task 4: Corriger le download — appliquer les couleurs, ajouter SVG

**Files:**
- Modify: `src/lib/qr-generator.ts`
- Modify: `src/app/api/qrcodes/[id]/download/route.ts`

**Step 1: Étendre `generateQrBuffer` pour accepter les couleurs et le format**

```ts
// src/lib/qr-generator.ts
import QRCode from "qrcode";

interface QrOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  width?: number;
}

export async function generateQrPng(text: string, opts: QrOptions = {}): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: opts.width ?? 1024,
    color: {
      dark: opts.foregroundColor ?? "#000000",
      light: opts.backgroundColor ?? "#FFFFFF",
    },
  });
}

export async function generateQrSvg(text: string, opts: QrOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: opts.width ?? 1024,
    color: {
      dark: opts.foregroundColor ?? "#000000",
      light: opts.backgroundColor ?? "#FFFFFF",
    },
  });
}
```

**Step 2: Réécrire la route download**

```ts
// src/app/api/qrcodes/[id]/download/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrPng, generateQrSvg } from "@/lib/qr-generator";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { id: params.id } });
  if (!qr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { url } = new URL(request.url);
  const searchParams = new URL(request.url).searchParams;
  const format = searchParams.get("format") ?? "png";
  const size = Math.min(Number(searchParams.get("size") ?? 1024), 4096);

  // The QR encodes the redirect URL, not the target URL directly
  const origin = new URL(request.url).origin;
  const redirectUrl = `${origin}/r/${qr.shortCode}`;
  const opts = {
    foregroundColor: qr.foregroundColor,
    backgroundColor: qr.backgroundColor,
    width: size,
  };

  const safeName = qr.name.replace(/[^a-zA-Z0-9-_]/g, "_");

  if (format === "svg") {
    const svg = await generateQrSvg(redirectUrl, opts);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${safeName}.svg"`,
      },
    });
  }

  const buffer = await generateQrPng(redirectUrl, opts);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${safeName}.png"`,
    },
  });
}
```

**Step 3: Commit**

```bash
git add src/lib/qr-generator.ts src/app/api/qrcodes/[id]/download/route.ts
git commit -m "feat: download endpoint supports colors, SVG format, Content-Disposition"
```

---

## Task 5: Enrichir le scan tracking avec geo Vercel

**Files:**
- Modify: `src/lib/scan-tracker.ts`
- Modify: `src/app/r/[shortCode]/route.ts`

**Step 1: Enrichir parseScan avec les headers Vercel geo**

```ts
// src/lib/scan-tracker.ts
import UAParser from "ua-parser-js";

export function parseScan(headers: Headers) {
  const parser = new UAParser(headers.get("user-agent") ?? "");
  const result = parser.getResult();
  return {
    device: result.device.type ?? "desktop",
    os: result.os.name ?? "Unknown",
    browser: result.browser.name ?? "Unknown",
    // Vercel injecte ces headers automatiquement en prod (gratuit)
    country: headers.get("x-vercel-ip-country") ?? null,
    city: headers.get("x-vercel-ip-city") ?? null,
    referer: headers.get("referer") ?? null,
  };
}
```

**Step 2: Mettre à jour la route redirect pour passer les nouveaux champs**

```ts
// src/app/r/[shortCode]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseScan } from "@/lib/scan-tracker";

export async function GET(request: Request, { params }: { params: { shortCode: string } }) {
  const qr = await prisma.qrCode.findUnique({ where: { shortCode: params.shortCode } });
  if (!qr) return NextResponse.redirect(new URL("/dashboard", request.url));

  const scan = parseScan(request.headers);
  await prisma.scan.create({
    data: {
      qrCodeId: qr.id,
      ip: request.headers.get("x-forwarded-for") ?? null,
      userAgent: request.headers.get("user-agent"),
      ...scan,
    },
  });

  const payload = qr.content as { url?: string };
  if (payload?.url) return NextResponse.redirect(payload.url, 302);
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

**Step 3: Commit**

```bash
git add src/lib/scan-tracker.ts src/app/r/[shortCode]/route.ts
git commit -m "feat: scan tracking with geo headers and referer"
```

---

## Task 6: Stats API — retourner des données agrégées

**Files:**
- Modify: `src/app/api/qrcodes/[id]/stats/route.ts`

**Step 1: Réécrire le endpoint stats avec agrégation**

```ts
// src/app/api/qrcodes/[id]/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const qrCodeId = params.id;

  const [total, byDevice, byOs, byBrowser, recentScans] = await Promise.all([
    prisma.scan.count({ where: { qrCodeId } }),
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.groupBy({
      by: ["os"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.groupBy({
      by: ["browser"],
      where: { qrCodeId },
      _count: true,
    }),
    prisma.scan.findMany({
      where: { qrCodeId },
      select: { scannedAt: true },
      orderBy: { scannedAt: "desc" },
      take: 1000,
    }),
  ]);

  // Agréger les scans par jour
  const dailyMap = new Map<string, number>();
  for (const s of recentScans) {
    const day = s.scannedAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    total,
    byDevice: byDevice.map((d) => ({ name: d.device ?? "unknown", value: d._count })),
    byOs: byOs.map((d) => ({ name: d.os ?? "unknown", value: d._count })),
    byBrowser: byBrowser.map((d) => ({ name: d.browser ?? "unknown", value: d._count })),
    daily,
  });
}
```

**Step 2: Commit**

```bash
git add src/app/api/qrcodes/[id]/stats/route.ts
git commit -m "feat: stats API returns aggregated scan data"
```

---

## Task 7: Refaire le Create Wizard — fonctionnel

**Files:**
- Modify: `src/app/(dashboard)/dashboard/qr/create/page.tsx`
- Delete: `src/components/qr/QrTypeSelector.tsx` (plus besoin, URL only)
- Modify: `src/components/qr/QrContentForm.tsx`
- Modify: `src/components/qr/QrDesignEditor.tsx`
- Modify: `src/components/qr/QrPreview.tsx`
- Modify: `src/components/qr/QrDownloadModal.tsx`

**Step 1: Simplifier QrContentForm — URL only**

```tsx
// src/components/qr/QrContentForm.tsx
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
```

**Step 2: Garder QrDesignEditor simple — 2 couleurs**

```tsx
// src/components/qr/QrDesignEditor.tsx
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
```

**Step 3: QrPreview reste quasi pareil**

```tsx
// src/components/qr/QrPreview.tsx
"use client";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  value: string;
  fg: string;
  bg: string;
  size?: number;
}

export function QrPreview({ value, fg, bg, size = 220 }: Props) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border bg-white p-6">
      <QRCodeSVG
        value={value || "https://example.com"}
        fgColor={fg}
        bgColor={bg}
        size={size}
        level="M"
      />
    </div>
  );
}
```

**Step 4: QrDownloadModal — vraie modale de téléchargement**

```tsx
// src/components/qr/QrDownloadModal.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface Props {
  qrId: string | null;
  qrName: string;
}

export function QrDownloadModal({ qrId, qrName }: Props) {
  const [open, setOpen] = useState(false);

  if (!qrId) return null;

  const download = (format: "png" | "svg") => {
    const url = `/api/qrcodes/${qrId}/download?format=${format}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${qrName}.${format}`;
    a.click();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Download size={16} />
        Télécharger
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Télécharger le QR Code</h3>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => download("png")}
                className="w-full rounded-lg border border-border px-4 py-3 text-left hover:bg-slate-50"
              >
                <p className="font-medium">PNG</p>
                <p className="text-sm text-muted">Image haute résolution (1024px)</p>
              </button>
              <button
                onClick={() => download("svg")}
                className="w-full rounded-lg border border-border px-4 py-3 text-left hover:bg-slate-50"
              >
                <p className="font-medium">SVG</p>
                <p className="text-sm text-muted">Vectoriel, qualité infinie pour impression</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 5: Réécrire la page Create**

```tsx
// src/app/(dashboard)/dashboard/qr/create/page.tsx
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
        {/* Left — Form */}
        <div className="space-y-6 rounded-lg border border-border bg-white p-6">
          <QrContentForm
            name={name}
            url={url}
            onNameChange={setName}
            onUrlChange={setUrl}
          />
          <QrDesignEditor fg={fg} bg={bg} setFg={setFg} setBg={setBg} />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

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

        {/* Right — Preview */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-white p-6">
            <p className="mb-3 text-sm text-muted">Aperçu en temps réel</p>
            <QrPreview value={url} fg={fg} bg={bg} />
          </div>
          {savedId && (
            <p className="text-center text-sm text-green-600">
              ✓ QR Code créé avec succès
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 6: Supprimer QrTypeSelector**

```bash
rm src/components/qr/QrTypeSelector.tsx
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: functional create wizard with save, preview, download"
```

---

## Task 8: QR Table — liste des QR codes avec données réelles

**Files:**
- Modify: `src/components/qr/QrTable.tsx`
- Modify: `src/hooks/useQrCodes.ts`

**Step 1: Améliorer le hook useQrCodes**

```ts
// src/hooks/useQrCodes.ts
"use client";
import { useEffect, useState, useCallback } from "react";

interface QrCodeItem {
  id: string;
  name: string;
  shortCode: string;
  foregroundColor: string;
  backgroundColor: string;
  content: { url?: string };
  createdAt: string;
  _count: { scans: number };
}

export function useQrCodes() {
  const [data, setData] = useState<QrCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/qrcodes")
      .then((r) => r.json())
      .then((d) => setData(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}
```

**Step 2: Réécrire QrTable**

```tsx
// src/components/qr/QrTable.tsx
"use client";
import Link from "next/link";
import { useQrCodes } from "@/hooks/useQrCodes";
import { QRCodeSVG } from "qrcode.react";
import { BarChart3, Download, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

export function QrTable() {
  const { data, loading, refresh } = useQrCodes();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce QR Code ?")) return;
    setDeleting(id);
    await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
    setDeleting(null);
    refresh();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
        <p className="text-lg font-medium">Aucun QR Code</p>
        <p className="mt-1 text-sm text-muted">Crée ton premier QR Code pour commencer le tracking.</p>
        <Link
          href="/dashboard/qr/create"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm text-white"
        >
          Créer un QR Code
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3">QR Code</th>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3 text-center">Scans</th>
            <th className="px-4 py-3">Créé le</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((qr) => (
            <tr key={qr.id} className="border-b border-border last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3">
                <QRCodeSVG
                  value={(qr.content as any)?.url ?? "https://example.com"}
                  size={40}
                  fgColor={qr.foregroundColor}
                  bgColor={qr.backgroundColor}
                />
              </td>
              <td className="px-4 py-3 font-medium">{qr.name}</td>
              <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                {(qr.content as any)?.url}
              </td>
              <td className="px-4 py-3 text-center font-semibold">
                {qr._count?.scans ?? 0}
              </td>
              <td className="px-4 py-3 text-muted">
                {new Date(qr.createdAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/qr/${qr.id}/stats`}
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Stats"
                  >
                    <BarChart3 size={16} />
                  </Link>
                  <a
                    href={`/api/qrcodes/${qr.id}/download?format=png`}
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Télécharger PNG"
                  >
                    <Download size={16} />
                  </a>
                  <a
                    href={`/r/${qr.shortCode}`}
                    target="_blank"
                    className="rounded p-1.5 hover:bg-slate-100"
                    title="Tester le lien"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(qr.id)}
                    disabled={deleting === qr.id}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/qr/QrTable.tsx src/hooks/useQrCodes.ts
git commit -m "feat: QrTable with real data, scan counts, actions"
```

---

## Task 9: Dashboard Home — stats réelles

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/components/stats/StatsOverview.tsx`
- Modify: `src/components/stats/ScanChart.tsx`
- Modify: `src/components/stats/DeviceChart.tsx`

**Step 1: Rendre le dashboard page server component qui fetch les stats**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { StatsOverview } from "@/components/stats/StatsOverview";
import { ScanChart } from "@/components/stats/ScanChart";
import { DeviceChart } from "@/components/stats/DeviceChart";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalQr, totalScans, scansToday, recentScans, deviceBreakdown] =
    await Promise.all([
      prisma.qrCode.count(),
      prisma.scan.count(),
      prisma.scan.count({ where: { scannedAt: { gte: today } } }),
      prisma.scan.findMany({
        where: { scannedAt: { gte: thirtyDaysAgo } },
        select: { scannedAt: true },
        orderBy: { scannedAt: "desc" },
      }),
      prisma.scan.groupBy({
        by: ["device"],
        _count: true,
      }),
    ]);

  // Agréger par jour
  const dailyMap = new Map<string, number>();
  for (const s of recentScans) {
    const day = s.scannedAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const devices = deviceBreakdown.map((d) => ({
    name: d.device ?? "unknown",
    value: d._count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsOverview
        totalQr={totalQr}
        totalScans={totalScans}
        scansToday={scansToday}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScanChart data={daily} />
        </div>
        <DeviceChart data={devices} />
      </div>
    </div>
  );
}
```

**Step 2: StatsOverview avec vraies données**

```tsx
// src/components/stats/StatsOverview.tsx
import { QrCode, ScanLine, TrendingUp } from "lucide-react";

interface Props {
  totalQr: number;
  totalScans: number;
  scansToday: number;
}

export function StatsOverview({ totalQr, totalScans, scansToday }: Props) {
  const stats = [
    { label: "QR Codes", value: totalQr, icon: QrCode },
    { label: "Scans total", value: totalScans, icon: ScanLine },
    { label: "Scans aujourd'hui", value: scansToday, icon: TrendingUp },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-lg border border-border bg-white p-4"
        >
          <div className="rounded-lg bg-blue-50 p-2.5">
            <Icon size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: ScanChart avec Recharts**

```tsx
// src/components/stats/ScanChart.tsx
"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; count: number }[];
}

export function ScanChart({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-4 text-sm font-medium">Scans — 30 derniers jours</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucun scan pour l'instant</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)} // MM-DD
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1A3C6E"
              fill="#1A3C6E"
              fillOpacity={0.1}
              name="Scans"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
```

**Step 4: DeviceChart avec Recharts PieChart**

```tsx
// src/components/stats/DeviceChart.tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#1A3C6E", "#4A90D9", "#00B4D8", "#64748B"];

interface Props {
  data: { name: string; value: number }[];
}

export function DeviceChart({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-4 text-sm font-medium">Appareils</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucune donnée</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: dashboard with real stats, area chart, device pie chart"
```

---

## Task 10: Page stats par QR Code

**Files:**
- Modify: `src/app/(dashboard)/dashboard/qr/[id]/stats/page.tsx`

**Step 1: Réécrire la page stats**

```tsx
// src/app/(dashboard)/dashboard/qr/[id]/stats/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScanChart } from "@/components/stats/ScanChart";
import { DeviceChart } from "@/components/stats/DeviceChart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QrStatsPage({ params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({
    where: { id: params.id },
    include: { _count: { select: { scans: true } } },
  });
  if (!qr) notFound();

  const [scans, deviceData] = await Promise.all([
    prisma.scan.findMany({
      where: { qrCodeId: qr.id },
      select: { scannedAt: true },
      orderBy: { scannedAt: "desc" },
      take: 1000,
    }),
    prisma.scan.groupBy({
      by: ["device"],
      where: { qrCodeId: qr.id },
      _count: true,
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (const s of scans) {
    const day = s.scannedAt.toISOString().split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const devices = deviceData.map((d) => ({
    name: d.device ?? "unknown",
    value: d._count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/qrcodes" className="rounded p-1 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{qr.name}</h1>
          <p className="text-sm text-muted">
            {qr._count.scans} scans au total • shortCode: {qr.shortCode}
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScanChart data={daily} />
        </div>
        <DeviceChart data={devices} />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/dashboard/qr/[id]/stats/page.tsx
git commit -m "feat: per-QR stats page with charts"
```

---

## Task 11: QR Detail/Edit page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/qr/[id]/page.tsx`

**Step 1: Réécrire la page détail**

```tsx
// src/app/(dashboard)/dashboard/qr/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Download, ExternalLink, Copy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QrDetailPage({ params }: { params: { id: string } }) {
  const qr = await prisma.qrCode.findUnique({
    where: { id: params.id },
    include: { _count: { select: { scans: true } } },
  });
  if (!qr) notFound();

  const payload = qr.content as { url?: string };
  const redirectUrl = `/r/${qr.shortCode}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/qrcodes" className="rounded p-1 hover:bg-slate-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">{qr.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Preview */}
        <div className="flex flex-col items-center rounded-lg border border-border bg-white p-8">
          <QRCodeSVG
            value={payload?.url ?? "https://example.com"}
            fgColor={qr.foregroundColor}
            bgColor={qr.backgroundColor}
            size={250}
            level="M"
          />
          <div className="mt-6 flex gap-3">
            <a
              href={`/api/qrcodes/${qr.id}/download?format=png`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              <Download size={14} /> PNG
            </a>
            <a
              href={`/api/qrcodes/${qr.id}/download?format=svg`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              <Download size={14} /> SVG
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 rounded-lg border border-border bg-white p-6">
          <div>
            <p className="text-sm text-muted">URL de destination</p>
            <p className="font-medium">{payload?.url}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Lien de tracking</p>
            <p className="font-mono text-sm">{redirectUrl}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Short code</p>
            <p className="font-mono text-sm">{qr.shortCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Scans</p>
            <p className="text-2xl font-bold">{qr._count.scans}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Créé le</p>
            <p>{new Date(qr.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href={`/dashboard/qr/${qr.id}/stats`}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <BarChart3 size={14} /> Voir les stats
            </Link>
            <a
              href={redirectUrl}
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-slate-50"
            >
              <ExternalLink size={14} /> Tester
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/dashboard/qr/[id]/page.tsx
git commit -m "feat: QR detail page with preview, download, info"
```

---

## Task 12: Polish — Font, Topbar, Layout, Settings

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/layout/Topbar.tsx`
- Modify: `src/app/(dashboard)/dashboard/settings/page.tsx`
- Modify: `src/app/(dashboard)/dashboard/settings/profile/page.tsx`
- Modify: `next.config.js`

**Step 1: Ajouter la font Inter**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QRGen — QR Code Tracker",
  description: "Crée et track tes QR codes pour flyers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 2: Simplifier le Topbar**

```tsx
// src/components/layout/Topbar.tsx
export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <div />
      <p className="text-sm text-muted">QRGen Internal</p>
    </header>
  );
}
```

**Step 3: Page settings minimale**

```tsx
// src/app/(dashboard)/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="rounded-lg border border-border bg-white p-6">
        <p className="text-sm text-muted">
          Outil interne QRGen. Pas de configuration nécessaire.
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Supprimer `typedRoutes` expérimental**

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

**Step 5: Commit**

```bash
git add -A
git commit -m "polish: Inter font, clean topbar, settings page, remove typedRoutes"
```

---

## Task 13: Configurer Supabase et déployer sur Vercel

**Pas de fichiers à modifier — configuration externe.**

**Step 1: Créer le projet Supabase**

1. Aller sur https://supabase.com → New Project
2. Choisir un nom (ex: `qrgen`) et une région EU
3. Copier la connection string depuis Settings > Database > Connection String > URI
4. Format: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**Step 2: Pousser le schema vers Supabase**

```bash
# Mettre la connection string Supabase dans .env
# DATABASE_URL="postgresql://postgres.[ref]:[password]@..."

npx prisma migrate deploy
npx prisma db seed
```

**Step 3: Déployer sur Vercel**

1. Push le repo sur GitHub
2. Aller sur https://vercel.com → Import Project → sélectionner le repo
3. Dans Environment Variables, ajouter :
   - `DATABASE_URL` = la connection string Supabase
4. Deploy

**Step 4: Tester le flow complet**

1. Ouvrir l'URL Vercel → redirigé vers `/dashboard`
2. Créer un QR Code avec l'URL de ton portfolio
3. Télécharger le PNG
4. Scanner le QR avec ton téléphone → vérifie la redirection
5. Retourner sur le dashboard → vérifie que le scan apparaît

**Step 5: Commit final**

```bash
git add -A
git commit -m "docs: deployment notes"
```

---

## Résumé des fichiers

| Action | Fichier |
|--------|---------|
| DELETE | `src/lib/auth.ts` |
| DELETE | `src/app/api/auth/[...nextauth]/route.ts` |
| DELETE | `src/app/(public)/login/page.tsx` |
| DELETE | `src/app/(public)/signup/page.tsx` |
| DELETE | `src/app/(public)/pricing/page.tsx` |
| DELETE | `src/app/(dashboard)/dashboard/settings/billing/page.tsx` |
| DELETE | `src/app/(dashboard)/dashboard/settings/domains/page.tsx` |
| DELETE | `src/app/(dashboard)/dashboard/settings/team/page.tsx` |
| DELETE | `src/app/(dashboard)/dashboard/bulk-create/page.tsx` |
| DELETE | `src/app/api/qrcodes/bulk/route.ts` |
| DELETE | `src/components/qr/QrTypeSelector.tsx` |
| MODIFY | `src/app/(public)/page.tsx` — redirect vers `/dashboard` |
| MODIFY | `src/components/layout/Sidebar.tsx` — icons, active state |
| MODIFY | `src/components/layout/Topbar.tsx` — simplifier |
| MODIFY | `src/app/api/qrcodes/route.ts` — POST fonctionnel, GET avec scan count |
| MODIFY | `src/app/api/qrcodes/[id]/download/route.ts` — couleurs, SVG, Content-Disposition |
| MODIFY | `src/app/api/qrcodes/[id]/stats/route.ts` — données agrégées |
| MODIFY | `src/lib/qr-generator.ts` — couleurs, SVG |
| MODIFY | `src/lib/scan-tracker.ts` — geo Vercel, referer |
| MODIFY | `src/app/r/[shortCode]/route.ts` — nouveaux champs scan |
| MODIFY | `src/app/(dashboard)/dashboard/page.tsx` — stats réelles |
| MODIFY | `src/app/(dashboard)/dashboard/qr/create/page.tsx` — wizard fonctionnel |
| MODIFY | `src/app/(dashboard)/dashboard/qr/[id]/page.tsx` — page détail |
| MODIFY | `src/app/(dashboard)/dashboard/qr/[id]/stats/page.tsx` — graphiques |
| MODIFY | `src/components/qr/QrContentForm.tsx` — name + URL |
| MODIFY | `src/components/qr/QrDesignEditor.tsx` — 2 couleurs |
| MODIFY | `src/components/qr/QrPreview.tsx` — error correction level |
| MODIFY | `src/components/qr/QrDownloadModal.tsx` — modale fonctionnelle |
| MODIFY | `src/components/qr/QrTable.tsx` — table avec données réelles |
| MODIFY | `src/components/stats/StatsOverview.tsx` — props réelles |
| MODIFY | `src/components/stats/ScanChart.tsx` — Recharts AreaChart |
| MODIFY | `src/components/stats/DeviceChart.tsx` — Recharts PieChart |
| MODIFY | `src/hooks/useQrCodes.ts` — loading state, refresh |
| MODIFY | `src/app/layout.tsx` — Inter font |
| MODIFY | `prisma/seed.ts` — simplifier, retirer bcrypt |
| MODIFY | `package.json` — build script, retirer deps |
| MODIFY | `.env.example` — Supabase |
| MODIFY | `next.config.js` — retirer typedRoutes |
