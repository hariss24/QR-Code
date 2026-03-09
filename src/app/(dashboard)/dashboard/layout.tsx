import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen"><Sidebar /><div className="flex-1"><Topbar /><div className="mx-auto max-w-7xl p-6">{children}</div></div></div>;
}
