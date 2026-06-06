"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Grid3X3, ImagePlus, List, Pencil, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FormField } from "@/components/admin/FormSection";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { assetUrl } from "@/lib/utils/assetUrl";
import { bulkDeleteMedia, deleteMedia, getMediaDetail, getMediaFolders, getMediaList, updateMedia, uploadMedia } from "@/lib/api/media";
import type { MediaFile } from "@/types";

const pageSize = 24;

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [folder, setFolder] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const mediaQuery = useQuery({
    queryKey: ["media", folder, search, page],
    queryFn: () => getMediaList({ folder: folder === "All" ? undefined : folder, search: search || undefined, page, pageSize }),
  });
  const foldersQuery = useQuery({ queryKey: ["media-folders"], queryFn: getMediaFolders });
  const detailQuery = useQuery({
    queryKey: ["media-detail", detailId],
    queryFn: () => getMediaDetail(detailId!),
    enabled: !!detailId,
  });
  const folders = useMemo(() => ["All", ...(foldersQuery.data ?? [])], [foldersQuery.data]);
  const media = mediaQuery.data?.items ?? [];
  const detail = detailQuery.data ?? media.find((item) => item.id === detailId) ?? null;

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => Promise.all(files.map((file) => uploadMedia(file, folder === "All" ? undefined : folder))),
    onSuccess: async () => {
      toast.success("Media uploaded");
      await invalidate();
    },
    onError: () => toast.error("Failed to upload media"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { altText?: string | null; folder?: string | null } }) => updateMedia(id, payload),
    onSuccess: async () => {
      toast.success("Media updated");
      await invalidate();
      await queryClient.invalidateQueries({ queryKey: ["media-detail"] });
    },
    onError: () => toast.error("Failed to update media"),
  });
  const deleteMutation = useMutation({
    mutationFn: ({ id, force }: { id: string; force: boolean }) => deleteMedia(id, force),
    onSuccess: async () => {
      setDeleteTarget(null);
      setDetailId(null);
      toast.success("Media deleted");
      await invalidate();
    },
    onError: () => toast.error("Delete failed. This media may be in use."),
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteMedia(selectedIds, true),
    onSuccess: async () => {
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      toast.success("Selected media deleted");
      await invalidate();
    },
    onError: () => toast.error("Bulk delete failed"),
  });

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ["media"] });
    await queryClient.invalidateQueries({ queryKey: ["media-folders"] });
  }

  const columns: Column<MediaFile>[] = [
    { key: "thumbnail", header: "", width: "72px", render: (row) => <img alt={row.altText ?? row.fileName} className="size-12 rounded object-cover" src={assetUrl(row.thumbnailPath ?? row.filePath)} /> },
    { key: "fileName", header: "File", sortable: true, width: "1.5fr", render: (row) => <div><p className="truncate font-medium">{row.fileName}</p><p className="mt-1 text-xs text-[#666666]">{row.mimeType}</p></div> },
    { key: "folder", header: "Folder", sortable: true, width: "0.8fr", render: (row) => row.folder ?? "general" },
    { key: "fileSize", header: "Size", sortable: true, width: "110px", render: (row) => formatBytes(row.fileSize) },
    { key: "usageCount", header: "Usage", sortable: true, width: "100px", render: (row) => <StatusBadge label={`${row.usageCount}`} variant={row.usageCount > 0 ? "info" : "neutral"} /> },
    { key: "createdAt", header: "Uploaded", sortable: true, width: "150px", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <>
      <PageHeader title="Media Library" description="Manage images, folders, metadata, and file usage." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Media" }]} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-[#2A2A2A] bg-[#141414] p-1">
          <IconButton active={view === "grid"} icon={Grid3X3} onClick={() => setView("grid")} />
          <IconButton active={view === "list"} icon={List} onClick={() => setView("list")} />
        </div>
        <div className="min-w-[280px] flex-1">
          <FilterBar
            searchPlaceholder="Search media..."
            searchValue={search}
            onSearchChange={(value) => { setSearch(value); setPage(1); }}
            filters={[{ key: "folder", label: "Folder", value: folder, onChange: (value) => { setFolder(value); setPage(1); }, options: folders.map((item) => ({ label: item, value: item })) }]}
          />
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200">
          <Upload className="size-4" />
          {uploadMutation.isPending ? "Uploading..." : "Upload"}
          <input multiple accept="image/*" className="hidden" type="file" onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) uploadMutation.mutate(files); event.currentTarget.value = ""; }} />
        </label>
      </div>

      {selectedIds.length > 0 ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-[#2A2A2A] bg-[#141414] p-3 text-sm">
          <span>{selectedIds.length} selected</span>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#EF4444] px-3 text-white" type="button" onClick={() => setBulkDeleteOpen(true)}><Trash2 className="size-4" />Delete selected</button>
        </div>
      ) : null}

      {view === "grid" ? (
        <MediaGrid
          data={media}
          isLoading={mediaQuery.isLoading}
          selectedIds={selectedIds}
          onSelect={(mediaFile) => setDetailId(mediaFile.id)}
          onToggle={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
        />
      ) : (
        <DataTable
          columns={columns}
          data={media}
          emptyMessage="No media files found"
          isLoading={mediaQuery.isLoading}
          page={mediaQuery.data?.page ?? page}
          pageSize={mediaQuery.data?.pageSize ?? pageSize}
          totalCount={mediaQuery.data?.totalCount ?? 0}
          onPageChange={setPage}
          onRowClick={(mediaFile) => setDetailId(mediaFile.id)}
          actions={(row) => <button className="inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] text-[#EF4444]" type="button" onClick={() => setDeleteTarget(row)}><Trash2 className="size-4" /></button>}
        />
      )}

      {view === "grid" && (mediaQuery.data?.totalCount ?? 0) > pageSize ? (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm text-[#A0A0A0]">
          <button className="h-9 rounded-md border border-[#2A2A2A] px-3 disabled:opacity-40" disabled={page <= 1} type="button" onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page}</span>
          <button className="h-9 rounded-md border border-[#2A2A2A] px-3 disabled:opacity-40" disabled={page * pageSize >= (mediaQuery.data?.totalCount ?? 0)} type="button" onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      ) : null}

      {detail ? <MediaDetailPanel media={detail} onClose={() => setDetailId(null)} onDelete={() => setDeleteTarget(detail)} onSave={(payload) => updateMutation.mutate({ id: detail.id, payload })} /> : null}
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, force: deleteTarget.usageCount > 0 })} title="Delete media" description={deleteTarget?.usageCount ? `This file is used by ${deleteTarget.usageCount} item(s). Force delete it?` : `Delete "${deleteTarget?.fileName}"? This cannot be undone.`} confirmLabel="Delete" confirmVariant="danger" isLoading={deleteMutation.isPending} />
      <ConfirmDialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={() => bulkDeleteMutation.mutate()} title="Delete selected media" description={`Delete ${selectedIds.length} selected file(s)? Files in use will be force deleted.`} confirmLabel="Delete selected" confirmVariant="danger" isLoading={bulkDeleteMutation.isPending} />
    </>
  );
}

function MediaGrid({ data, isLoading, onSelect, onToggle, selectedIds }: Readonly<{ data: MediaFile[]; isLoading: boolean; selectedIds: string[]; onSelect: (media: MediaFile) => void; onToggle: (id: string) => void }>) {
  if (isLoading) {
    return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <span className="aspect-square shimmer rounded-md" key={index} />)}</div>;
  }

  if (data.length === 0) {
    return <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-[#2A2A2A] text-[#A0A0A0]"><div className="text-center"><ImagePlus className="mx-auto mb-3 size-8" /><p>No media files found</p></div></div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {data.map((media) => (
        <article className="group overflow-hidden rounded-md border border-[#2A2A2A] bg-[#141414]" key={media.id}>
          <div className="relative">
            <button className="block w-full" type="button" onClick={() => onSelect(media)}>
              <img alt={media.altText ?? media.fileName} className="aspect-square w-full object-cover" src={assetUrl(media.thumbnailPath ?? media.filePath)} />
            </button>
            <button className={`absolute left-2 top-2 inline-flex size-7 items-center justify-center rounded-md border border-white/20 ${selectedIds.includes(media.id) ? "bg-white text-black" : "bg-black/70 text-white opacity-0 group-hover:opacity-100"}`} type="button" onClick={() => onToggle(media.id)}>
              {selectedIds.includes(media.id) ? <Check className="size-4" /> : null}
            </button>
          </div>
          <div className="p-3">
            <p className="truncate text-sm text-white">{media.fileName}</p>
            <p className="mt-1 text-xs text-[#666666]">{media.folder ?? "general"} · {formatBytes(media.fileSize)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MediaDetailPanel({ media, onClose, onDelete, onSave }: Readonly<{ media: MediaFile; onClose: () => void; onDelete: () => void; onSave: (payload: { altText?: string | null; folder?: string | null }) => void }>) {
  const toast = useToast();
  const [altText, setAltText] = useState(media.altText ?? "");
  const [folder, setFolder] = useState(media.folder ?? "");

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-[#2A2A2A] bg-[#141414] shadow-2xl">
      <header className="flex items-center justify-between border-b border-[#2A2A2A] p-4">
        <h2 className="text-lg font-medium">Media details</h2>
        <button className="inline-flex size-9 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-[#1E1E1E]" type="button" onClick={onClose}><X className="size-4" /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <img alt={media.altText ?? media.fileName} className="mb-4 aspect-square w-full rounded-md object-cover" src={assetUrl(media.filePath)} />
        <div className="mb-5 grid gap-2 text-sm text-[#A0A0A0]">
          <p className="truncate text-white">{media.fileName}</p>
          <p>{media.mimeType}</p>
          <p>{formatBytes(media.fileSize)}</p>
          <p>{media.width && media.height ? `${media.width} x ${media.height}` : "Dimensions unavailable"}</p>
          <p>Uploaded by {media.uploadedByName}</p>
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#2A2A2A] text-white hover:bg-[#1E1E1E]" type="button" onClick={async () => { await navigator.clipboard.writeText(media.filePath); toast.success("URL copied"); }}><Copy className="size-4" />Copy URL</button>
        </div>
        <FormField label="Alt text"><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={altText} onChange={(event) => setAltText(event.target.value)} /></FormField>
        <FormField label="Folder"><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={folder} onChange={(event) => setFolder(event.target.value)} /></FormField>
        <section className="mt-6 rounded-md border border-[#2A2A2A] p-4">
          <h3 className="mb-3 text-sm font-medium text-white">Usage</h3>
          {media.usages && media.usages.length > 0 ? (
            <div className="grid gap-2 text-xs text-[#A0A0A0]">
              {media.usages.map((usage) => <p key={usage.id}>{usage.entityType}: {usage.entityId} · {usage.fieldName}</p>)}
            </div>
          ) : <p className="text-sm text-[#666666]">Not used yet</p>}
        </section>
      </div>
      <footer className="flex justify-between border-t border-[#2A2A2A] p-4">
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#2A2A2A] px-4 text-sm text-[#EF4444]" type="button" onClick={onDelete}><Trash2 className="size-4" />Delete</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black" type="button" onClick={() => onSave({ altText, folder })}><Pencil className="size-4" />Save</button>
      </footer>
    </aside>
  );
}

function IconButton({ active, icon: Icon, onClick }: Readonly<{ active: boolean; icon: typeof Grid3X3; onClick: () => void }>) {
  return <button className={`inline-flex size-8 items-center justify-center rounded ${active ? "bg-white text-black" : "text-[#A0A0A0] hover:bg-[#1E1E1E]"}`} type="button" onClick={onClick}><Icon className="size-4" /></button>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
