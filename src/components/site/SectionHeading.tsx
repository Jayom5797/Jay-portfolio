export function SectionHeading({
  index,
  title,
  action,
}: {
  index?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-steel-800 pb-4">
      <div className="flex items-baseline gap-4">
        {index && <span className="tech-label text-accent-bright">{index}</span>}
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
