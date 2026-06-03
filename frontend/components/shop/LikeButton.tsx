"use client";

import { Heart } from "lucide-react";

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function LikeButton({ count, isLiked, onToggle, size = "md" }: Readonly<LikeButtonProps>) {
  const iconSize = size === "sm" ? "size-4" : "size-5";
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full transition active:scale-90 ${isLiked ? "text-[#EF4444]" : "text-zinc-400 hover:text-white"}`}
      onClick={(event) => {
        event.preventDefault();
        onToggle();
      }}
    >
      <Heart className={`${iconSize} ${isLiked ? "fill-current" : ""}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}
