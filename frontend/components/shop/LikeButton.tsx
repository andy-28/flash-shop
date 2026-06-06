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
  const [isAnimating, setIsAnimating] = useState(false);
  const iconSize = size === "sm" ? "size-4" : "size-5";
  return (
    <button
      type="button"
      disabled={isLocked}
      className={`inline-flex items-center gap-1.5 rounded-full transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-70 ${isLiked ? "text-status-danger" : "text-text-secondary hover:text-text-primary"}`}
      onClick={(event) => {
        event.preventDefault();
        if (isLocked) return;
        if (!isLiked) {
          setIsAnimating(true);
          window.setTimeout(() => setIsAnimating(false), 420);
        }
        setIsLocked(true);
        onToggle();
        window.setTimeout(() => setIsLocked(false), 500);
      }}
    >
      <Heart className={`${iconSize} transition-colors duration-200 ${isLiked ? "fill-current" : ""} ${isAnimating ? "animate-heartbeat" : ""}`} />
      <span className={`text-sm ${isAnimating ? "animate-fade-in-up" : ""}`}>{count}</span>
    </button>
  );
}
