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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
      <section className="w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#A0A0A0]">{description}</p>
          </div>
          <button className="inline-flex size-8 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-[#1E1E1E]" type="button" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-9 rounded-md px-3 text-sm text-[#A0A0A0] hover:bg-[#1E1E1E]" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium disabled:opacity-50 ${
              confirmVariant === "danger" ? "bg-[#EF4444] text-white" : "bg-white text-black"
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
