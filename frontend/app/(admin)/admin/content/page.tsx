"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Power, Trash2 } from "lucide-react";
import {
  createContentBlock,
  deleteContentBlock,
  getAdminContentList,
  reorderContentBlocks,
  toggleContentBlock,
  updateContentBlock,
  uploadContentImage,
} from "@/lib/api/content";
import { assetUrl } from "@/lib/utils/assetUrl";
import type { ContentBlock, ContentBlockPayload } from "@/types";

const placements = ["All", "home_banner", "home_story", "home_promo", "shop_banner"];
const linkTypes = ["None", "Internal", "External", "Product"];

const emptyForm: ContentBlockPayload = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  linkType: "None",
  placement: "home_banner",
  isActive: true,
  startAt: null,
  endAt: null,
};

function getStatus(block: ContentBlock) {
  const now = Date.now();
  const startsLater = block.startAt ? new Date(block.startAt).getTime() > now : false;
  const ended = block.endAt ? new Date(block.endAt).getTime() < now : false;

  if (!block.isActive) {
    return { label: "已下架", className: "bg-zinc-500/15 text-zinc-400" };
  }

  if (startsLater) {
    return { label: "排程中", className: "bg-[#3B82F6]/15 text-[#3B82F6]" };
  }

  if (ended) {
    return { label: "已過期", className: "bg-zinc-500/15 text-zinc-400" };
  }

  return { label: "上架中", className: "bg-[#22C55E]/15 text-[#22C55E]" };
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const [placement, setPlacement] = useState("All");
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [form, setForm] = useState<ContentBlockPayload>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["admin-content", placement],
    queryFn: () => getAdminContentList(placement),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-content"] });

  const saveMutation = useMutation({
    mutationFn: (payload: ContentBlockPayload) =>
      editing ? updateContentBlock(editing.id, payload) : createContentBlock(payload),
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm);
      setMessage("內容已儲存");
      void invalidate();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleContentBlock,
    onSuccess: () => void invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContentBlock,
    onSuccess: () => void invalidate(),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ block, direction }: { block: ContentBlock; direction: -1 | 1 }) => {
      const group = blocks.filter((item) => item.placement === block.placement).sort((a, b) => a.position - b.position);
      const index = group.findIndex((item) => item.id === block.id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= group.length) {
        return Promise.resolve();
      }

      const next = [...group];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return reorderContentBlocks(block.placement, next.map((item) => item.id));
    },
    onSuccess: () => void invalidate(),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadContentImage,
    onSuccess: (url) => setForm((current) => ({ ...current, imageUrl: url })),
  });

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.placement.localeCompare(b.placement) || a.position - b.position),
    [blocks],
  );

  function edit(block: ContentBlock) {
    setEditing(block);
    setMessage(null);
    setForm({
      title: block.title,
      subtitle: block.subtitle ?? "",
      imageUrl: block.imageUrl,
      linkUrl: block.linkUrl ?? "",
      linkType: block.linkType,
      placement: block.placement,
      isActive: block.isActive,
      startAt: toDateTimeLocal(block.startAt),
      endAt: toDateTimeLocal(block.endAt),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    saveMutation.mutate({
      ...form,
      startAt: toIsoOrNull(form.startAt ?? ""),
      endAt: toIsoOrNull(form.endAt ?? ""),
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase text-zinc-500">CMS</p>
            <h1 className="mt-2 text-3xl font-semibold">內容管理</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setMessage(null);
            }}
          >
            <Plus className="size-4" />
            新增內容
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {placements.map((item) => (
            <button
              key={item}
              type="button"
              className={`h-9 rounded-md border px-3 text-sm ${
                placement === item ? "border-white bg-white text-black" : "border-white/10 bg-[#141414] text-zinc-300 hover:bg-white/10"
              }`}
              onClick={() => setPlacement(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? <p className="rounded-md border border-white/10 bg-[#141414] p-4 text-sm text-zinc-400">Loading content...</p> : null}
          {!isLoading && sortedBlocks.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-[#141414] p-4 text-sm text-zinc-400">尚未建立內容。</p>
          ) : null}
          {sortedBlocks.map((block) => {
            const status = getStatus(block);
            return (
              <article key={block.id} className="grid gap-4 rounded-md border border-white/10 bg-[#141414] p-4 md:grid-cols-[128px_1fr_auto]">
                <Image
                  src={assetUrl(block.imageUrl)}
                  alt={block.title}
                  width={128}
                  height={96}
                  className="h-24 w-32 rounded-md object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{block.title}</h2>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">{block.placement}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  </div>
                  {block.subtitle ? <p className="mt-2 text-sm text-zinc-400">{block.subtitle}</p> : null}
                  <p className="mt-2 text-xs text-zinc-500">Position {block.position}</p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-md border border-white/10" onClick={() => reorderMutation.mutate({ block, direction: -1 })}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-md border border-white/10" onClick={() => reorderMutation.mutate({ block, direction: 1 })}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-md border border-white/10" onClick={() => edit(block)}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-md border border-white/10" onClick={() => toggleMutation.mutate(block.id)}>
                    <Power className="size-4" />
                  </button>
                  <button type="button" className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-[#EF4444]" onClick={() => deleteMutation.mutate(block.id)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="h-fit rounded-md border border-white/10 bg-[#141414] p-5 xl:sticky xl:top-20">
        <h2 className="text-lg font-semibold">{editing ? "編輯內容" : "新增內容"}</h2>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Title" />
          <input value={form.subtitle ?? ""} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Subtitle" />
          <input required value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Image URL" />
          <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 text-sm text-zinc-300 hover:bg-white/10">
            <ImagePlus className="size-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload image"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                uploadMutation.mutate(file);
              }
            }} />
          </label>
          {form.imageUrl ? (
            <Image
              src={assetUrl(form.imageUrl)}
              alt="Preview"
              width={640}
              height={144}
              className="h-36 w-full rounded-md object-cover"
            />
          ) : null}
          <input value={form.linkUrl ?? ""} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Link URL" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.linkType} onChange={(event) => setForm({ ...form, linkType: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white">
              {linkTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select disabled={!!editing} value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white disabled:opacity-60">
              {placements.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="datetime-local" value={form.startAt ?? ""} onChange={(event) => setForm({ ...form, startAt: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" />
            <input type="datetime-local" value={form.endAt ?? ""} onChange={(event) => setForm({ ...form, endAt: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Active
          </label>
          {message ? <p className="text-sm text-[#22C55E]">{message}</p> : null}
          {saveMutation.isError ? <p className="text-sm text-[#EF4444]">儲存失敗，請檢查欄位。</p> : null}
          <button className="h-10 w-full rounded-md bg-white text-sm font-medium text-black disabled:opacity-50" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "儲存內容"}
          </button>
        </form>
      </aside>
    </div>
  );
}
