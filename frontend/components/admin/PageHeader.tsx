import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function PageHeader({ action, breadcrumbs = [], description, title }: Readonly<PageHeaderProps>) {
  const Icon = action?.icon;

  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-[#2A2A2A] pb-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {breadcrumbs.length > 0 ? (
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
            {breadcrumbs.map((item, index) => (
              <span className="inline-flex items-center gap-2" key={`${item.label}-${index}`}>
                {item.href ? <Link className="hover:text-[#A0A0A0]" href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-2xl font-medium text-white">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#A0A0A0]">{description}</p> : null}
      </div>
      {action ? (
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200"
          onClick={action.onClick}
        >
          {Icon ? <Icon className="size-4" /> : null}
          {action.label}
        </button>
      ) : null}
    </header>
  );
}
