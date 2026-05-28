interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormField({ children, description, error, label, required = false }: Readonly<FormFieldProps>) {
  return (
    <label className="mb-5 grid gap-2 text-sm">
      <span className="text-[#A0A0A0]">
        {label}
        {required ? <span className="ml-1 text-[#EF4444]">*</span> : null}
      </span>
      {description ? <span className="text-xs text-[#666666]">{description}</span> : null}
      {children}
      {error ? <span className="text-xs text-[#EF4444]">{error}</span> : null}
    </label>
  );
}

export function FormSection({ children, description, title }: Readonly<FormSectionProps>) {
  return (
    <section className="border-b border-[#2A2A2A] pb-5 last:border-b-0">
      <h2 className="text-base font-medium text-white">{title}</h2>
      {description ? <p className="mt-1 text-sm text-[#A0A0A0]">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
