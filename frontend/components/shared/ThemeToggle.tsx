"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme, type Theme } from "@/lib/hooks/useTheme";

interface ThemeToggleProps {
  compact?: boolean;
  showDropdown?: boolean;
}

const options: Array<{ label: string; value: Theme; icon: typeof Sun }> = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Monitor },
];

export function ThemeToggle({ compact = false, showDropdown = false }: Readonly<ThemeToggleProps>) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const Icon = resolvedTheme === "dark" ? Sun : Moon;

  if (!showDropdown) {
    return (
      <button
        type="button"
        className="btn-icon inline-flex size-11 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-bg-tertiary hover:text-text-primary md:size-9"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-default px-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary md:h-9"
        onClick={() => setOpen((value) => !value)}
        aria-label="Theme menu"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="size-4" />
          {compact ? "Theme" : options.find((option) => option.value === theme)?.label ?? "Theme"}
        </span>
      </button>
      {open ? (
        <div className="absolute bottom-12 left-0 z-40 w-44 overflow-hidden rounded-md border border-border-default bg-bg-secondary shadow-xl">
          {options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <button
                className="flex h-11 w-full items-center justify-between px-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                key={option.value}
                type="button"
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <OptionIcon className="size-4" />
                  {option.label}
                </span>
                {theme === option.value ? <Check className="size-4" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
