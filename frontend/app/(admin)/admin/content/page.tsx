"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowDown, ArrowUp, History, Pencil, Plus, Power, RotateCcw, Send, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import {
  archiveContentBlock,
  createContentBlock,
  deleteContentBlock,
  getAdminContentList,
  getContentVersions,
  publishContentBlock,
  reorderContentBlocks,
  restoreContentVersion,
  unpublishContentBlock,
  updateContentBlock,
} from "@/lib/api/content";
import type { ContentBlock, ContentBlockPayload, ContentVersion } from "@/types";

const placements = ["All", "home_banner", "home_story", "home_promo", "shop_banner", "contents_feed"];
const statuses = ["All", "Draft", "Published", "Archived"];
const linkTypes = ["None", "Internal", "External", "Product"];
const contentCategories = ["", "News", "Behind", "Video", "Event"];
const emptyForm: ContentBlockPayload = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  linkType: "None",
  placement: "home_banner",
  body: "",
  slug: "",
  category: "",
  videoUrl: "",
  summary: "",
  isActive: false,
  startAt: null,
  endAt: null,
  changeNote: "",
};

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [placement, setPlacement] = useState("All");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentBlock | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<ContentVersion | null>(null);
  const [form, setForm] = useState<ContentBlockPayload>(emptyForm);
  const { data: blocks = [], isLoading } = useQuery({ queryKey: ["admin-content", placement], queryFn: () => getAdminContentList(placement) });
  const { data: versions = [] } = useQuery({
    queryKey: ["content-versions", editing?.id],
    queryFn: () => getContentVersions(editing!.id),
    enabled: !!editing,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-content"] });
  const sortedBlocks = useMemo(() => {
    return [...blocks]
      .filter((block) => status === "All" || block.status === status)
      .sort((a, b) => a.placement.localeCompare(b.placement) || a.position - b.position);
  }, [blocks, status]);
  const saveMutation = useMutation({
    mutationFn: (payload: ContentBlockPayload) => editing ? updateContentBlock(editing.id, payload) : createContentBlock(payload),
    onSuccess: async () => { toast.success("Content saved"); await invalidate(); await queryClient.invalidateQueries({ queryKey: ["content-versions"] }); },
    onError: () => toast.error("Failed to save content"),
  });
  const publishMutation = useMutation({ mutationFn: publishContentBlock, onSuccess: async () => { toast.success("Content published"); await invalidate(); } });
  const unpublishMutation = useMutation({ mutationFn: unpublishContentBlock, onSuccess: async () => { toast.success("Content moved to draft"); await invalidate(); } });
  const archiveMutation = useMutation({ mutationFn: archiveContentBlock, onSuccess: async () => { toast.success("Content archived"); await invalidate(); } });
  const restoreMutation = useMutation({
    mutationFn: ({ contentId, versionId }: { contentId: string; versionId: string }) => restoreContentVersion(contentId, versionId),
    onSuccess: async () => {
      setRestoreTarget(null);
      toast.success("Version restored");
      await invalidate();
      await queryClient.invalidateQueries({ queryKey: ["content-versions"] });
    },
  });
  const deleteMutation = useMutation({ mutationFn: deleteContentBlock, onSuccess: async () => { setDeleteTarget(null); toast.success("Content deleted"); await invalidate(); } });
  const reorderMutation = useMutation({
    mutationFn: ({ block, direction }: { block: ContentBlock; direction: -1 | 1 }) => {
      const group = blocks.filter((item) => item.placement === block.placement).sort((a, b) => a.position - b.position);
      const index = group.findIndex((item) => item.id === block.id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= group.length) return Promise.resolve();
      const next = [...group];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return reorderContentBlocks(block.placement, next.map((item) => item.id));
    },
    onSuccess: async () => { toast.success("Content reordered"); await invalidate(); },
  });
  const columns: Column<ContentBlock>[] = [
    { key: "title", header: "Content", sortable: true, width: "1.4fr", render: (row) => <div><p className="font-medium">{row.title}</p><p className="mt-1 text-xs text-text-tertiary">{row.subtitle}</p></div> },
    { key: "placement", header: "Placement", sortable: true, width: "0.8fr", render: (row) => <span className="text-text-secondary">{row.placement}</span> },
    { key: "position", header: "Position", sortable: true, width: "90px" },
    { key: "linkType", header: "Link", width: "120px" },
    { key: "status", header: "Status", width: "120px", render: (row) => <StatusBadge label={row.status} variant={row.status === "Published" ? "success" : row.status === "Draft" ? "info" : "neutral"} /> },
  ];

  function edit(block: ContentBlock) {
    setEditing(block);
    setForm({
      title: block.title,
      subtitle: block.subtitle ?? "",
      imageUrl: block.imageUrl,
      linkUrl: block.linkUrl ?? "",
      linkType: block.linkType,
      placement: block.placement,
      body: block.body ?? "",
      slug: block.slug ?? "",
      category: block.category ?? "",
      videoUrl: block.videoUrl ?? "",
      summary: block.summary ?? "",
      isActive: block.isActive,
      startAt: toDateTimeLocal(block.startAt),
      endAt: toDateTimeLocal(block.endAt),
      changeNote: "",
    });
  }

  function save() {
    return saveMutation.mutateAsync({ ...form, startAt: toIsoOrNull(form.startAt ?? ""), endAt: toIsoOrNull(form.endAt ?? "") });
  }

  async function saveAndPublish() {
    const saved = await saveMutation.mutateAsync({ ...form, startAt: toIsoOrNull(form.startAt ?? ""), endAt: toIsoOrNull(form.endAt ?? "") });
    await publishMutation.mutateAsync(saved.id);
    setEditing(saved);
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  return (
    <>
      <PageHeader title="Content" description="Manage drafts, published placements, and versioned rich content." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Content" }]} action={{ label: "New Content", icon: Plus, onClick: resetForm }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section>
          <FilterBar filters={[
            { key: "placement", label: "Placement", value: placement, onChange: setPlacement, options: placements.map((item) => ({ label: item, value: item })) },
            { key: "status", label: "Status", value: status, onChange: setStatus, options: statuses.map((item) => ({ label: item, value: item })) },
          ]} />
          <DataTable columns={columns} data={sortedBlocks} emptyMessage="No content blocks found" isLoading={isLoading} actions={(row) => (
            <>
              <IconButton icon={ArrowUp} onClick={() => reorderMutation.mutate({ block: row, direction: -1 })} />
              <IconButton icon={ArrowDown} onClick={() => reorderMutation.mutate({ block: row, direction: 1 })} />
              <IconButton icon={Pencil} onClick={() => edit(row)} />
              {row.status === "Draft" ? <IconButton icon={Send} onClick={() => publishMutation.mutate(row.id)} /> : null}
              {row.status === "Published" ? <IconButton icon={Power} onClick={() => unpublishMutation.mutate(row.id)} /> : null}
              {row.status !== "Archived" ? <IconButton icon={Archive} onClick={() => archiveMutation.mutate(row.id)} /> : <IconButton icon={RotateCcw} onClick={() => unpublishMutation.mutate(row.id)} />}
              <IconButton danger icon={Trash2} onClick={() => setDeleteTarget(row)} />
            </>
          )} />
        </section>
        <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 xl:sticky xl:top-8">
          <FormSection title={editing ? "Edit Content" : "Create Content"}>
            <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <TextField label="Subtitle" value={form.subtitle ?? ""} onChange={(value) => setForm({ ...form, subtitle: value })} />
            <TextField label="Slug" value={form.slug ?? ""} onChange={(value) => setForm({ ...form, slug: value })} />
            <TextField label="Summary" value={form.summary ?? ""} onChange={(value) => setForm({ ...form, summary: value })} />
            <FormField label="Banner image" required><MediaPicker value={form.imageUrl} folder="banners" onChange={(url) => setForm({ ...form, imageUrl: url })} /></FormField>
            <FormField label="Body"><RichTextEditor value={form.body ?? ""} onChange={(value) => setForm({ ...form, body: value })} placeholder="Write rich content..." /></FormField>
            <TextField label="Link URL" value={form.linkUrl ?? ""} onChange={(value) => setForm({ ...form, linkUrl: value })} />
            <TextField label="Video URL" value={form.videoUrl ?? ""} onChange={(value) => setForm({ ...form, videoUrl: value })} />
            <SelectField label="Category" value={form.category ?? ""} options={contentCategories} onChange={(value) => setForm({ ...form, category: value })} />
            <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Link Type" value={form.linkType} options={linkTypes} onChange={(value) => setForm({ ...form, linkType: value })} /><SelectField disabled={!!editing} label="Placement" value={form.placement} options={placements.filter((item) => item !== "All")} onChange={(value) => setForm({ ...form, placement: value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2"><DateField label="Start" value={form.startAt ?? ""} onChange={(value) => setForm({ ...form, startAt: value })} /><DateField label="End" value={form.endAt ?? ""} onChange={(value) => setForm({ ...form, endAt: value })} /></div>
            {editing ? <TextField label="Change Note" value={form.changeNote ?? ""} onChange={(value) => setForm({ ...form, changeNote: value })} /> : null}
          </FormSection>
          <div className="grid gap-2">
            <MutationButton label="Save draft" loadingLabel="Saving..." onClick={save} disabled={saveMutation.isPending || (!!editing && !form.changeNote?.trim())} />
            <MutationButton label="Save & publish" loadingLabel="Publishing..." onClick={saveAndPublish} disabled={saveMutation.isPending || publishMutation.isPending || (!!editing && !form.changeNote?.trim())} />
          </div>
          {editing ? (
            <div className="mt-6 border-t border-border-default pt-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary"><History className="size-4" />Versions</div>
              <div className="grid gap-2">
                {versions.map((version) => (
                  <div key={version.id} className="rounded-md border border-border-default bg-bg-tertiary p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-text-primary">v{version.versionNumber} · {version.title}</p>
                        <p className="mt-1 text-xs text-text-tertiary">{version.modifiedByName} · {new Date(version.createdAt).toLocaleString()}</p>
                        <p className="mt-1 text-xs text-text-secondary">{version.changeNote}</p>
                      </div>
                      <button className="inline-flex size-8 items-center justify-center rounded-md border border-border-default text-text-secondary" type="button" onClick={() => setRestoreTarget(version)}>
                        <RotateCcw className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="Delete content" description={`Delete "${deleteTarget?.title}"? This action cannot be undone.`} confirmLabel="Delete" confirmVariant="danger" isLoading={deleteMutation.isPending} />
      <ConfirmDialog open={!!restoreTarget} onClose={() => setRestoreTarget(null)} onConfirm={() => editing && restoreTarget && restoreMutation.mutate({ contentId: editing.id, versionId: restoreTarget.id })} title="Restore version" description={`Restore "${restoreTarget?.title}" from v${restoreTarget?.versionNumber}? A new version will be created.`} confirmLabel="Restore" confirmVariant="primary" isLoading={restoreMutation.isPending} />
    </>
  );
}

function toDateTimeLocal(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function IconButton({ danger = false, icon: Icon, onClick }: Readonly<{ danger?: boolean; icon: typeof Pencil; onClick: () => void }>) {
  return <button className={`inline-flex size-8 items-center justify-center rounded-md border border-border-default ${danger ? "text-status-danger" : ""}`} type="button" onClick={onClick}><Icon className="size-4" /></button>;
}

function TextField({ label, onChange, value }: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return <FormField label={label}><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}

function SelectField({ disabled = false, label, onChange, options, value }: Readonly<{ disabled?: boolean; label: string; value: string; options: string[]; onChange: (value: string) => void }>) {
  return <FormField label={label}><select className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none disabled:opacity-60" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select></FormField>;
}

function DateField({ label, onChange, value }: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return <FormField label={label}><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}
