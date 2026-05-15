export function DataTable() {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500">
        <span>Name</span>
        <span>Status</span>
        <span>Owner</span>
        <span className="text-right">Updated</span>
      </div>
      {[
        ["Hero campaign", "Draft", "Marketing", "Today"],
        ["Signal Hoodie", "Published", "Merch", "Yesterday"],
        ["Launch FAQ", "Review", "Support", "May 15"],
      ].map(([name, status, owner, updated]) => (
        <div className="grid grid-cols-4 px-4 py-3 text-sm" key={name}>
          <span className="font-medium">{name}</span>
          <span>{status}</span>
          <span className="text-slate-600">{owner}</span>
          <span className="text-right text-slate-600">{updated}</span>
        </div>
      ))}
    </div>
  );
}
