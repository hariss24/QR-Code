"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, QrCode, Settings, Plus } from "lucide-react";

const links = [
  { href: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/qrcodes" as const, label: "QR Codes", icon: QrCode },
  { href: "/dashboard/settings" as const, label: "Paramètres", icon: Settings },
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
