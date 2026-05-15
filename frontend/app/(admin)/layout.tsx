import { Sidebar } from "@/components/admin/Sidebar";
import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[248px_1fr]">
      <Sidebar />
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Workspace</p>
            <p className="text-sm font-semibold">Local Development</p>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium"
          >
            View site
          </Link>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
