import { Sidebar } from "@/components/admin/Sidebar";
import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-black text-white md:grid md:grid-cols-[248px_1fr]">
      <Sidebar />
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950 px-5">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-500">Workspace</p>
            <p className="text-sm font-semibold">Local Development</p>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            View site
          </Link>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
