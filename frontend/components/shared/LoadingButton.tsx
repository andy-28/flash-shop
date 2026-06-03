"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps {
  onClick?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loadingText?: string;
  className?: string;
  type?: "button" | "submit";
}

const variantClass = {
  primary: "bg-white text-black hover:bg-zinc-200",
  danger: "bg-[#EF4444] text-white hover:bg-red-500",
  ghost: "border border-[#2A2A2A] text-white hover:bg-white/10",
  outline: "border border-[#404040] text-white hover:bg-white/10",
};

const sizeClass = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function LoadingButton({
  children,
  className,
  disabled = false,
  fullWidth = false,
  isLoading = false,
  loadingText,
  onClick,
  size = "md",
  type = "button",
  variant = "primary",
}: Readonly<LoadingButtonProps>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
      {isLoading ? loadingText ?? children : children}
    </button>
  );
}
