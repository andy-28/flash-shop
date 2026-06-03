"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onToggle: () => void;
  size?: "sm" | "md";
}

export function LikeButton({ count, isLiked, onToggle, size = "md" }: Readonly<LikeButtonProps>) {
  const [isLocked, setIsLocked] = useState(false);
  const iconSize = size === "sm" ? "size-4" : "size-5";
  return (
    <button
      type="button"
      disabled={isLocked}
      className={`inline-flex items-center gap-1.5 rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-70 ${isLiked ? "text-[#EF4444]" : "text-zinc-400 hover:text-white"}`}
      onClick={(event) => {
        event.preventDefault();
        if (isLocked) return;
        setIsLocked(true);
        onToggle();
        window.setTimeout(() => setIsLocked(false), 500);
      }}
    >
      <Heart className={`${iconSize} ${isLiked ? "fill-current" : ""}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}
