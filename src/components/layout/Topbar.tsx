export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-white p-4">
      <input aria-label="Recherche globale" className="w-1/2 rounded-lg border border-border px-3 py-2" placeholder="Rechercher QR code..." />
      <div className="text-sm text-muted">Notifications • Profil</div>
    </header>
  );
}
