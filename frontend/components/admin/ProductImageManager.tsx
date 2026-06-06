"use client";

import { Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { assetUrl } from "@/lib/utils/assetUrl";
import { DragDropImageUploader } from "./DragDropImageUploader";

interface ProductImageManagerProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove: () => void;
  disabled?: boolean;
}

export function ProductImageManager({ currentImageUrl, disabled = false, onRemove, onUpload }: Readonly<ProductImageManagerProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: File[]) {
    const firstFile = files[0];
    if (!firstFile) return;

    setIsUploading(true);
    setError(null);
    try {
      await onUpload(firstFile);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-border-default bg-bg-primary">
        {currentImageUrl ? (
          <>
            <div className="relative">
              <img alt="" className="h-52 w-full object-cover" src={assetUrl(currentImageUrl)} />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-overlay px-2.5 py-1 text-xs text-text-primary backdrop-blur">
                <Star className="size-3.5 fill-white" />
                Primary image
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="min-w-0 truncate text-xs text-text-secondary">{currentImageUrl}</p>
              <button
                className="inline-flex h-8 items-center gap-2 rounded-md border border-border-default px-3 text-xs text-status-danger hover:bg-bg-tertiary disabled:opacity-50"
                disabled={disabled || isUploading}
                type="button"
                onClick={onRemove}
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="grid h-36 place-items-center text-sm text-text-tertiary">No product image selected</div>
        )}
      </div>

      <DragDropImageUploader disabled={disabled} isUploading={isUploading} onUpload={handleUpload} />
      {error ? <p className="text-xs text-status-danger">{error}</p> : null}
      <p className="text-xs text-text-tertiary">FlashShop currently stores one primary product image. Uploading a new image replaces the current one.</p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } | string } }).response;
    if (typeof response?.data === "string") return response.data;
    if (response?.data?.message) return response.data.message;
  }

  if (error instanceof Error) return error.message;
  return "Failed to upload image.";
}
