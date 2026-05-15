import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className="p-6">{children}</main>
    </div>
  );
}
