import { AlertTriangle } from "lucide-react";

export function ErrorState({ message, onRetry }: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <div className="grid min-h-40 place-items-center text-center">
      <div>
        <AlertTriangle className="mx-auto size-10 text-[#EF4444]" />
        <p className="mt-3 text-sm text-[#EF4444]">{message}</p>
        {onRetry ? (
          <button className="mt-4 h-9 rounded-md border border-[#2A2A2A] px-3 text-sm text-white hover:bg-[#1E1E1E]" type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
