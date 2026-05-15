export function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </section>
  );
}
