import { Search } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onChange: (value: string) => void;
  }[];
}

export function FilterBar({ filters = [], onSearchChange, searchPlaceholder = "Search...", searchValue = "" }: Readonly<FilterBarProps>) {
  if (!onSearchChange && filters.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {onSearchChange ? (
        <label className="flex h-10 min-w-64 flex-1 items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#141414] px-3">
          <Search className="size-4 text-[#666666]" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#666666]"
            placeholder={searchPlaceholder}
          />
        </label>
      ) : null}
      {filters.map((filter) => (
        <label className="grid gap-1 text-xs text-[#666666]" key={filter.key}>
          {filter.label}
          <select
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className="h-10 min-w-36 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm text-white outline-none hover:border-[#404040]"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
