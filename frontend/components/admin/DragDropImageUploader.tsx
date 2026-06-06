"use client";

import { ImagePlus, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

interface DragDropImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
  isUploading?: boolean;
}

export function DragDropImageUploader({ disabled = false, isUploading = false, onUpload }: Readonly<DragDropImageUploaderProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | File[]) {
    if (disabled || isUploading) return;

    const files = Array.from(fileList);
    const invalid = files.find((file) => !allowedTypes.has(file.type));
    if (invalid) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    const oversized = files.find((file) => file.size > maxFileSize);
    if (oversized) {
      setError("Each image must be 5MB or smaller.");
      return;
    }

    setError(null);
    await onUpload(files);
  }

  return (
    <div className="space-y-2">
      <button
        className={`flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 py-6 text-center text-sm transition ${
          isDragging ? "border-accent-primary bg-bg-elevated text-text-primary" : "border-border-hover bg-bg-primary text-text-secondary hover:bg-bg-tertiary"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={disabled || isUploading}
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
      >
        {isUploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        <span className="font-medium text-text-primary">{isUploading ? "Uploading image..." : "Drag images here to upload"}</span>
        <span className="text-xs text-text-secondary">or click to choose JPG, PNG, or WebP files. Max 5MB each.</span>
        {!isUploading ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-primary">
            <Upload className="size-3.5" />
            Choose image
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        multiple
        type="file"
        onChange={(event) => {
          void handleFiles(event.target.files ?? []);
          event.currentTarget.value = "";
        }}
      />
      {error ? <p className="text-xs text-status-danger">{error}</p> : null}
    </div>
  );
}
