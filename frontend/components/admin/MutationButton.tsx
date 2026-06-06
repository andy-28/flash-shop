"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import { useState } from "react";

interface MutationButtonProps {
  onClick: () => void | Promise<unknown>;
  label: string;
  loadingLabel?: string;
  variant?: "primary" | "danger" | "ghost";
  icon?: LucideIcon;
  disabled?: boolean;
  type?: "button" | "submit";
}

const variantClass = {
  primary: "bg-accent-primary text-accent-primary-text hover:opacity-90",
  danger: "bg-status-danger text-white hover:bg-red-500",
  ghost: "border border-border-default text-text-primary hover:bg-bg-tertiary",
};

export function MutationButton({
  disabled = false,
  icon: Icon,
  label,
  loadingLabel = "Working...",
  onClick,
  type = "button",
  variant = "primary",
}: Readonly<MutationButtonProps>) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium disabled:opacity-50 ${variantClass[variant]}`}
      disabled={disabled || isLoading}
      type={type}
      onClick={type === "submit" ? undefined : handleClick}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {isLoading ? loadingLabel : label}
    </button>
  );
}
