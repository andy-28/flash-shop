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
  primary: "bg-accent-primary text-accent-primary-text hover:opacity-90",
  danger: "bg-status-danger text-white hover:bg-red-500",
  ghost: "border border-border-default text-text-primary hover:bg-bg-tertiary",
  outline: "border border-border-hover text-text-primary hover:bg-bg-tertiary",
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
        "btn-primary inline-flex items-center justify-center gap-2 rounded-md font-medium disabled:cursor-not-allowed disabled:opacity-60",
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
