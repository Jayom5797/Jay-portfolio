import { cn } from "@/lib/utils";

type Tone = "neutral" | "published" | "draft" | "featured" | "accent";

const tones: Record<Tone, string> = {
  neutral: "border-steel-700 text-steel-300",
  published: "border-emerald-800/70 text-emerald-300",
  draft: "border-amber-800/70 text-amber-300",
  featured: "border-accent-dim text-accent-bright",
  accent: "border-accent-dim text-accent-bright",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-label",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
