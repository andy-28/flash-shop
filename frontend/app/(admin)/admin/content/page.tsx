"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { createContentBlock, deleteContentBlock, getAdminContentList, reorderContentBlocks, toggleContentBlock, updateContentBlock } from "@/lib/api/content";
import type { ContentBlock, ContentBlockPayload } from "@/types";

const placements = ["All", "home_banner", "home_story", "home_promo", "shop_banner"];
const linkTypes = ["None", "Internal", "External", "Product"];
const emptyForm: ContentBlockPayload = { title: "", subtitle: "", imageUrl: "", linkUrl: "", linkType: "None", placement: "home_banner", isActive: true, startAt: null, endAt: null };

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [placement, setPlacement] = useState("All");
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState<ContentBlockPayload>(emptyForm);
  const { data: blocks = [], isLoading } = useQuery({ queryKey: ["admin-content", placement], queryFn: () => getAdminContentList(placement) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-content"] });
  const sortedBlocks = useMemo(() => [...blocks].sort((a, b) => a.placement.localeCompare(b.placement) || a.position - b.position), [blocks]);
  const saveMutation = useMutation({
    mutationFn: (payload: ContentBlockPayload) => editing ? updateContentBlock(editing.id, payload) : createContentBlock(payload),
    onSuccess: async () => { setEditing(null); setForm(emptyForm); toast.success("Content saved"); await invalidate(); },
    onError: () => toast.error("Failed to save content"),
  });
  const toggleMutation = useMutation({ mutationFn: toggleContentBlock, onSuccess: async () => { toast.success("Content status updated"); await invalidate(); } });
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
    { key: "title", header: "Content", sortable: true, width: "1.4fr", render: (row) => <div><p className="font-medium">{row.title}</p><p className="mt-1 text-xs text-[#666666]">{row.subtitle}</p></div> },
    { key: "placement", header: "Placement", sortable: true, width: "0.8fr", render: (row) => <span className="text-[#A0A0A0]">{row.placement}</span> },
    { key: "position", header: "Position", sortable: true, width: "90px" },
    { key: "linkType", header: "Link", width: "120px" },
    { key: "status", header: "Status", width: "120px", render: (row) => <StatusBadge {...contentStatus(row)} /> },
  ];

  function edit(block: ContentBlock) {
    setEditing(block);
    setForm({ title: block.title, subtitle: block.subtitle ?? "", imageUrl: block.imageUrl, linkUrl: block.linkUrl ?? "", linkType: block.linkType, placement: block.placement, isActive: block.isActive, startAt: toDateTimeLocal(block.startAt), endAt: toDateTimeLocal(block.endAt) });
  }

  function save() {
    return saveMutation.mutateAsync({ ...form, startAt: toIsoOrNull(form.startAt ?? ""), endAt: toIsoOrNull(form.endAt ?? "") });
  }

  return (
    <>
      <PageHeader title="Content" description="Manage homepage and shop content blocks." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Content" }]} action={{ label: "New Content", icon: Plus, onClick: () => { setEditing(null); setForm(emptyForm); } }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section>
          <FilterBar filters={[{ key: "placement", label: "Placement", value: placement, onChange: setPlacement, options: placements.map((item) => ({ label: item, value: item })) }]} />
          <DataTable columns={columns} data={sortedBlocks} emptyMessage="No content blocks found" isLoading={isLoading} actions={(row) => (<><IconButton icon={ArrowUp} onClick={() => reorderMutation.mutate({ block: row, direction: -1 })} /><IconButton icon={ArrowDown} onClick={() => reorderMutation.mutate({ block: row, direction: 1 })} /><IconButton icon={Pencil} onClick={() => edit(row)} /><IconButton icon={Power} onClick={() => toggleMutation.mutate(row.id)} /><IconButton danger icon={Trash2} onClick={() => setDeleteTarget(row)} /></>)} />
        </section>
        <aside className="h-fit rounded-md border border-[#2A2A2A] bg-[#141414] p-5 xl:sticky xl:top-8">
          <FormSection title={editing ? "Edit Content" : "Create Content"}>
            <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <TextField label="Subtitle" value={form.subtitle ?? ""} onChange={(value) => setForm({ ...form, subtitle: value })} />
            <FormField label="Banner image" required><MediaPicker value={form.imageUrl} folder="banners" onChange={(url) => setForm({ ...form, imageUrl: url })} /></FormField>
            <TextField label="Link URL" value={form.linkUrl ?? ""} onChange={(value) => setForm({ ...form, linkUrl: value })} />
            <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Link Type" value={form.linkType} options={linkTypes} onChange={(value) => setForm({ ...form, linkType: value })} /><SelectField disabled={!!editing} label="Placement" value={form.placement} options={placements.filter((item) => item !== "All")} onChange={(value) => setForm({ ...form, placement: value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2"><DateField label="Start" value={form.startAt ?? ""} onChange={(value) => setForm({ ...form, startAt: value })} /><DateField label="End" value={form.endAt ?? ""} onChange={(value) => setForm({ ...form, endAt: value })} /></div>
            <label className="mb-5 flex items-center gap-2 text-sm text-[#A0A0A0]"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Active</label>
          </FormSection>
          <MutationButton label="Save content" loadingLabel="Saving..." onClick={save} disabled={saveMutation.isPending} />
        </aside>
      </div>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="Delete content" description={`Delete "${deleteTarget?.title}"? This action cannot be undone.`} confirmLabel="Delete" confirmVariant="danger" isLoading={deleteMutation.isPending} />
    </>
  );
}

function contentStatus(block: ContentBlock) {
  const now = Date.now();
  if (!block.isActive) return { label: "Inactive", variant: "neutral" as const };
  if (block.startAt && new Date(block.startAt).getTime() > now) return { label: "Scheduled", variant: "info" as const };
  if (block.endAt && new Date(block.endAt).getTime() < now) return { label: "Expired", variant: "neutral" as const };
  return { label: "Active", variant: "success" as const };
}

function toDateTimeLocal(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function IconButton({ danger = false, icon: Icon, onClick }: Readonly<{ danger?: boolean; icon: typeof Pencil; onClick: () => void }>) {
  return <button className={`inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] ${danger ? "text-[#EF4444]" : ""}`} type="button" onClick={onClick}><Icon className="size-4" /></button>;
}

function TextField({ label, onChange, value }: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return <FormField label={label}><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}

function SelectField({ disabled = false, label, onChange, options, value }: Readonly<{ disabled?: boolean; label: string; value: string; options: string[]; onChange: (value: string) => void }>) {
  return <FormField label={label}><select className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none disabled:opacity-60" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select></FormField>;
}

function DateField({ label, onChange, value }: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return <FormField label={label}><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}
