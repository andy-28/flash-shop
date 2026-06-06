import { AlertTriangle } from "lucide-react";

export function ErrorState({ message, onRetry }: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <div className="grid min-h-40 place-items-center text-center">
      <div>
        <AlertTriangle className="mx-auto size-10 text-status-danger" />
        <p className="mt-3 text-sm text-status-danger">{message}</p>
        {onRetry ? (
          <button className="mt-4 h-9 rounded-md border border-border-default px-3 text-sm text-text-primary hover:bg-bg-tertiary" type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
