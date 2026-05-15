import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { CalendarDays, FileText, ImageIcon, PackagePlus } from "lucide-react";

const queue = [
  { title: "Homepage hero", type: "Banner", icon: ImageIcon },
  { title: "Drop announcement", type: "Content", icon: FileText },
  { title: "Capsule products", type: "Catalog", icon: PackagePlus },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase text-slate-500">CMS Overview</p>
          <h1 className="mt-2 text-3xl font-semibold">Manage content, drops, and shop operations.</h1>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white">
          <PackagePlus className="size-4" />
          New entry
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Published pages" value="12" />
        <StatCard label="Draft entries" value="7" />
        <StatCard label="Live products" value="24" />
        <StatCard label="Open orders" value="18" />
      </section>

      <section id="contents" className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Publishing queue</h2>
            <span className="text-sm text-slate-500">Next 7 days</span>
          </div>
          <DataTable />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-slate-500" />
            <h2 className="font-semibold">Today</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {queue.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3" key={item.title}>
                  <Icon className="size-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="analytics" className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Analytics snapshot</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Campaign CTR 8.4%", "Cart conversion 3.2%", "Returning members 41%"].map((item) => (
            <div className="rounded-md bg-slate-50 p-4 text-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
