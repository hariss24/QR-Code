import Link from "next/link";

const links = ["dashboard", "qrcodes", "folders", "bulk-create", "settings"];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-white p-4">
      <Link href="/dashboard" className="mb-6 block text-xl font-bold text-primary">QRGen</Link>
      <Link href="/dashboard/qr/create" className="mb-4 block rounded-lg bg-accent p-2 text-center text-white">Créer QR Code</Link>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link} href={`/dashboard/${link === "dashboard" ? "" : link}`} className="block rounded-lg px-3 py-2 capitalize hover:bg-slate-100">{link}</Link>
        ))}
      </nav>
    </aside>
  );
}
