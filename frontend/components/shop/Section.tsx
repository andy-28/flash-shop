"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}

export function Section({ action, children, className = "", subtitle, title }: Readonly<SectionProps>) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"} ${className}`}>
      {title || subtitle || action ? (
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            {title ? <h2 className="text-xl font-medium text-text-primary sm:text-2xl">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
          </div>
          {action ? (
            <Link href={action.href} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
              {action.label}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
