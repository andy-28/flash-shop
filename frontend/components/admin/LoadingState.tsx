import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: Readonly<{ label?: string }>) {
  return (
    <div className="grid min-h-40 place-items-center text-sm text-text-secondary">
      <span className="inline-flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </span>
    </div>
  );
}
