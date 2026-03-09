import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRGen Internal",
  description: "Clone SaaS QR Code Generator pour usage interne",
  openGraph: { title: "QRGen", description: "Plateforme QR codes" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
