"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function StatCard({
  icon: Icon,
  label,
  tone = "default",
  value,
}: Readonly<{ icon?: LucideIcon; label: string; tone?: "default" | "danger" | "success" | "warning"; value: string }>) {
  const toneClass = {
    default: "text-text-primary",
    danger: "text-status-danger",
    success: "text-status-success",
    warning: "text-status-warning",
  }[tone];
  const animatedValue = useAnimatedValue(value);

  return (
    <section className="rounded-md border border-border-default bg-bg-secondary p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">{label}</p>
        {Icon ? <Icon className={`size-5 ${toneClass}`} /> : null}
      </div>
      <p className={`mt-3 text-2xl font-semibold ${toneClass}`}>{animatedValue}</p>
    </section>
  );
}

function useAnimatedValue(value: string) {
  const parsed = useMemo(() => parseDisplayNumber(value), [value]);
  const [current, setCurrent] = useState(parsed ? 0 : Number.NaN);

  useEffect(() => {
    if (!parsed) return;

    const start = performance.now();
    const duration = 900;
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(parsed.number * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [parsed]);

  if (!parsed) {
    return value;
  }

  const formatted = parsed.hasDecimals
    ? current.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    : Math.round(current).toLocaleString();

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

function parseDisplayNumber(value: string) {
  const match = value.match(/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const number = Number(match[2].replace(/,/g, ""));
  if (!Number.isFinite(number)) return null;
  return {
    prefix: match[1],
    number,
    suffix: match[3],
    hasDecimals: match[2].includes("."),
  };
}
