import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import type { ProjectDTO } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectDTO }) {
  const cover = project.coverImage;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-steel-800 bg-ink-900 transition-colors hover:border-steel-600"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-800">
        {cover ? (
          <Image
            src={cover.url}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="blueprint-grid grid h-full w-full place-items-center">
            <span className="tech-label">No preview</span>
          </div>
        )}
        {project.featured && (
          <div className="absolute left-3 top-3">
            <Badge tone="featured">Featured</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="tech-label">
            {project.category?.name ?? "Uncategorized"}
          </span>
          {project.year && <span className="tech-label">{project.year}</span>}
        </div>

        <h3 className="flex items-start justify-between gap-2 font-display text-lg font-semibold leading-tight tracking-tight">
          <span>{project.title}</span>
          <span className="mt-0.5 shrink-0 translate-x-0 font-mono text-sm text-steel-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-bright">
            →
          </span>
        </h3>

        {project.shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-steel-400">
            {project.shortDescription}
          </p>
        )}

        {project.software.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.software.slice(0, 3).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
