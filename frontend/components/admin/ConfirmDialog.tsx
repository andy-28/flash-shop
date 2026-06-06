import { Loader2, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  description,
  isLoading = false,
  onClose,
  onConfirm,
  open,
  title,
}: Readonly<ConfirmDialogProps>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid animate-fade-in place-items-end bg-overlay px-0 sm:place-items-center sm:px-4">
      <section className="max-h-[85vh] w-full animate-slide-in-up overflow-y-auto rounded-t-2xl border border-border-default bg-bg-secondary p-5 shadow-2xl sm:max-w-md sm:animate-scale-in sm:rounded-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          <button className="inline-flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary sm:size-8" type="button" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-11 rounded-md px-3 text-sm text-text-secondary hover:bg-bg-tertiary sm:h-9" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium disabled:opacity-50 ${
              confirmVariant === "danger" ? "bg-status-danger text-white" : "bg-accent-primary text-accent-primary-text"
            }`}
            disabled={isLoading}
            type="button"
            onClick={onConfirm}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
