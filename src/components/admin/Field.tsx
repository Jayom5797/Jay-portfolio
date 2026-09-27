import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="tech-label mb-2 block">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-steel-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full border border-steel-700 bg-ink-900 px-3 py-2.5 text-sm text-paper placeholder:text-steel-600 focus:border-accent focus:outline-none";

export const textareaClass = cn(inputClass, "min-h-[120px] resize-y leading-relaxed");
