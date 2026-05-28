import { Inbox, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ action, description, icon: Icon = Inbox, title }: Readonly<EmptyStateProps>) {
  return (
    <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
      <div>
        <Icon className="mx-auto size-10 text-[#666666]" />
        <p className="mt-4 font-medium text-white">{title}</p>
        {description ? <p className="mt-2 text-sm text-[#A0A0A0]">{description}</p> : null}
        {action ? (
          <button className="mt-5 h-9 rounded-md bg-white px-3 text-sm font-medium text-black" type="button" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
