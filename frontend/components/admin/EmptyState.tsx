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
        <Icon className="mx-auto size-10 text-text-tertiary" />
        <p className="mt-4 font-medium text-text-primary">{title}</p>
        {description ? <p className="mt-2 text-sm text-text-secondary">{description}</p> : null}
        {action ? (
          <button className="mt-5 h-9 rounded-md bg-accent-primary px-3 text-sm font-medium text-accent-primary-text" type="button" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
