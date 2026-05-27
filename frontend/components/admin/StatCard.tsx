import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  tone = "default",
  value,
}: Readonly<{ icon?: LucideIcon; label: string; tone?: "default" | "danger" | "success" | "warning"; value: string }>) {
  const toneClass = {
    default: "text-white",
    danger: "text-[#EF4444]",
    success: "text-[#22C55E]",
    warning: "text-[#F59E0B]",
  }[tone];

  return (
    <section className="rounded-md border border-white/10 bg-[#141414] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{label}</p>
        {Icon ? <Icon className={`size-5 ${toneClass}`} /> : null}
      </div>
      <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </section>
  );
}
