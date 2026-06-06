"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pin, PinOff, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { getAdminCommunityPosts, hideAdminPost, toggleAdminPostPin } from "@/lib/api/community";
import type { AdminCommunityPost } from "@/types";

const categoryOptions = [
  { label: "All", value: "All" },
  { label: "General", value: "General" },
  { label: "Unboxing", value: "Unboxing" },
  { label: "Outfit", value: "Outfit" },
  { label: "Q&A", value: "QnA" },
  { label: "Announcement", value: "Announcement" },
];

export default function AdminCommunityPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [category, setCategory] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<AdminCommunityPost | null>(null);
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-community-posts"],
    queryFn: getAdminCommunityPosts,
  });

  const pinMutation = useMutation({
    mutationFn: toggleAdminPostPin,
    onSuccess: async () => {
      toast.success("Community post updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["community"] });
    },
    onError: () => toast.error("Failed to update post"),
  });

  const hideMutation = useMutation({
    mutationFn: hideAdminPost,
    onSuccess: async () => {
      setDeleteTarget(null);
      toast.success("Community post hidden");
      await queryClient.invalidateQueries({ queryKey: ["admin-community-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["community"] });
    },
    onError: () => toast.error("Failed to hide post"),
  });

  const filteredPosts = category === "All" ? posts : posts.filter((post) => post.category === category);
  const columns: Column<AdminCommunityPost>[] = [
    {
      key: "title",
      header: "Post",
      sortable: true,
      width: "1.6fr",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          <p className="mt-1 text-xs text-text-tertiary">by {row.authorName}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true, width: "0.8fr", render: (row) => <StatusBadge label={row.category} variant="neutral" /> },
    { key: "likeCount", header: "Likes", sortable: true, width: "0.5fr" },
    { key: "commentCount", header: "Comments", sortable: true, width: "0.6fr" },
    {
      key: "isPinned",
      header: "Pinned",
      sortable: true,
      width: "0.6fr",
      render: (row) => <StatusBadge label={row.isPinned ? "Pinned" : "Normal"} variant={row.isPinned ? "info" : "neutral"} />,
    },
    {
      key: "isHidden",
      header: "Visibility",
      sortable: true,
      width: "0.7fr",
      render: (row) => <StatusBadge label={row.isHidden ? "Hidden" : "Visible"} variant={row.isHidden ? "danger" : "success"} />,
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      width: "0.9fr",
      render: (row) => <span className="text-text-secondary">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Community"
        description="Moderate posts, pin highlights, and hide inappropriate content."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Community" }]}
      />
      <FilterBar
        filters={[
          {
            key: "category",
            label: "Category",
            options: categoryOptions,
            value: category,
            onChange: setCategory,
          },
        ]}
      />
      <DataTable
        columns={columns}
        data={filteredPosts}
        emptyMessage="No community posts found"
        isLoading={isLoading}
        actions={(post) => (
          <>
            <Link
              href={`/community/${post.id}`}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary"
              title="View"
            >
              <Eye className="size-4" />
            </Link>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary"
              title={post.isPinned ? "Unpin" : "Pin"}
              onClick={() => pinMutation.mutate(post.id)}
            >
              {post.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </button>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border-default text-status-danger hover:border-status-danger disabled:opacity-40"
              title="Hide"
              disabled={post.isHidden}
              onClick={() => setDeleteTarget(post)}
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && hideMutation.mutate(deleteTarget.id)}
        title="Hide community post"
        description={`Hide "${deleteTarget?.title}" from the public community board?`}
        confirmLabel="Hide"
        isLoading={hideMutation.isPending}
      />
    </>
  );
}
