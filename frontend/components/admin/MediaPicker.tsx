"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Search, Trash2, Upload, X } from "lucide-react";
import { assetUrl } from "@/lib/utils/assetUrl";
import { getMediaList, uploadMedia } from "@/lib/api/media";
import type { MediaFile } from "@/types";

interface MediaPickerProps {
  value?: string | null;
  onChange: (url: string, mediaId: string) => void;
  folder?: string;
  placeholder?: string;
}

export function MediaPicker({ folder, onChange, placeholder = "Select Image", value }: Readonly<MediaPickerProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-md border border-[#2A2A2A] bg-black">
          <img alt="" className="h-36 w-full object-cover" src={assetUrl(value)} />
          <div className="flex items-center justify-between gap-2 p-3">
            <p className="min-w-0 truncate text-xs text-[#A0A0A0]">{value}</p>
            <div className="flex gap-2">
              <button className="rounded-md border border-[#2A2A2A] px-3 py-1.5 text-xs text-white hover:bg-[#1E1E1E]" type="button" onClick={() => setOpen(true)}>Change</button>
              <button className="inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] text-[#EF4444]" type="button" onClick={() => onChange("", "")}>
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#404040] text-sm text-[#A0A0A0] hover:bg-[#1E1E1E]" type="button" onClick={() => setOpen(true)}>
          <ImagePlus className="size-5" />
          {placeholder}
        </button>
      )}
      {open ? <MediaPickerDialog folder={folder} onClose={() => setOpen(false)} onSelect={(media) => { onChange(media.filePath, media.id); setOpen(false); }} /> : null}
    </div>
  );
}

function MediaPickerDialog({ folder, onClose, onSelect }: Readonly<{ folder?: string; onClose: () => void; onSelect: (media: MediaFile) => void }>) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["media-picker", folder, search],
    queryFn: () => getMediaList({ folder, search: search || undefined, pageSize: 24 }),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMedia(file, folder),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media-picker"] });
      await queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4">
      <section className="flex max-h-[84vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#141414] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#2A2A2A] p-4">
          <div>
            <h2 className="text-lg font-medium text-white">Select media</h2>
            <p className="mt-1 text-xs text-[#A0A0A0]">{folder ? `Folder: ${folder}` : "All folders"}</p>
          </div>
          <button className="inline-flex size-9 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-[#1E1E1E]" type="button" onClick={onClose}>
            <X className="size-4" />
          </button>
        </header>
        <div className="flex flex-wrap items-center gap-3 border-b border-[#2A2A2A] p-4">
          <label className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]" />
            <input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black pl-9 pr-3 text-sm outline-none" placeholder="Search media..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200">
            <Upload className="size-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
            <input multiple accept="image/*" className="hidden" type="file" onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => uploadMutation.mutate(file)); event.currentTarget.value = ""; }} />
          </label>
        </div>
        <div className="overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <span className="aspect-square animate-pulse rounded-md bg-[#252525]" key={index} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="grid min-h-52 place-items-center rounded-md border border-dashed border-[#2A2A2A] text-sm text-[#A0A0A0]">No media found</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((media) => (
                <button className="group overflow-hidden rounded-md border border-[#2A2A2A] bg-black text-left hover:border-[#404040]" key={media.id} type="button" onClick={() => onSelect(media)}>
                  <img alt={media.altText ?? media.fileName} className="aspect-square w-full object-cover" src={assetUrl(media.thumbnailPath ?? media.filePath)} />
                  <div className="p-3">
                    <p className="truncate text-sm text-white">{media.fileName}</p>
                    <p className="mt-1 text-xs text-[#666666]">{formatBytes(media.fileSize)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
