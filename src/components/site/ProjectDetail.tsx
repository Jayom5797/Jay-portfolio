import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Gallery } from "@/components/site/Gallery";
import { ProjectModels } from "@/components/site/ProjectModels";
import { DrawingViewer } from "@/components/site/DrawingViewer";
import { technicalFields } from "@/lib/mappers";
import { formatBytes } from "@/lib/utils";
import type { ProjectDTO } from "@/lib/types";

/**
 * The canonical project-detail layout. Fully generic and content-driven — the
 * SAME component renders every project (seed or future) and the admin preview.
 * Sections that have no content simply don't render.
 */
export function ProjectDetail({ project }: { project: ProjectDTO }) {
  const fields = technicalFields(project);
  const hasCaseStudy = project.caseStudy.length > 0;
  const hasGallery = project.gallery.length > 0;
  const hasDrawings = project.drawings.length > 0;
  const hasDocuments = project.documents.length > 0;
  const hasVideos = project.videos.length > 0;

  return (
    <article className="content-wrap py-12 md:py-16">
      {/* Breadcrumb */}
      <Link href="/projects" className="tech-label text-steel-400 hover:text-paper">
        ← Projects
      </Link>

      {/* Header */}
      <header className="mt-6 grid gap-6 border-b border-steel-800 pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {project.category && <Badge tone="accent">{project.category.name}</Badge>}
            {project.featured && <Badge tone="featured">Featured</Badge>}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {project.title}
          </h1>
          {project.shortDescription && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-steel-300">
              {project.shortDescription}
            </p>
          )}
        </div>

        {project.software.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {project.software.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        )}
      </header>

      {/* Main layout: viewer + technical sidebar */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <ProjectModels models={project.models} />

          {project.description && (
            <div className="mt-10">
              <span className="tech-label text-accent-bright">Overview</span>
              <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-steel-200">
                {project.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Technical info — only supplied fields appear */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {fields.length > 0 && (
            <div className="border border-steel-800 bg-ink-900">
              <div className="border-b border-steel-800 px-5 py-3">
                <span className="tech-label">Technical Information</span>
              </div>
              <dl className="divide-y divide-steel-800">
                {fields.map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 px-5 py-3">
                    <dt className="tech-label pt-0.5">{f.label}</dt>
                    <dd className="text-right text-sm text-steel-200">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {project.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Case study */}
      {hasCaseStudy && (
        <section className="mt-16 border-t border-steel-800 pt-12">
          <span className="tech-label text-accent-bright">Case Study</span>
          <div className="mt-8 space-y-12">
            {project.caseStudy.map((section) => (
              <div key={section.id} className="grid gap-4 md:grid-cols-[220px_1fr]">
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {section.heading}
                </h3>
                <div className="space-y-4 text-[15px] leading-relaxed text-steel-200">
                  {section.body.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {hasGallery && (
        <section className="mt-16 border-t border-steel-800 pt-12">
          <span className="tech-label text-accent-bright">Gallery</span>
          <div className="mt-8">
            <Gallery images={project.gallery} />
          </div>
        </section>
      )}

      {/* Technical drawings */}
      {hasDrawings && (
        <section className="mt-16 border-t border-steel-800 pt-12">
          <span className="tech-label text-accent-bright">Technical Drawings</span>
          <div className="mt-8">
            <DrawingViewer drawings={project.drawings} />
          </div>
        </section>
      )}

      {/* Videos */}
      {hasVideos && (
        <section className="mt-16 border-t border-steel-800 pt-12">
          <span className="tech-label text-accent-bright">Video</span>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {project.videos.map((v) => (
              <video
                key={v.id}
                src={v.url}
                controls
                className="w-full border border-steel-800 bg-black"
              />
            ))}
          </div>
        </section>
      )}

      {/* Documents / files */}
      {hasDocuments && (
        <section className="mt-16 border-t border-steel-800 pt-12">
          <span className="tech-label text-accent-bright">Files</span>
          <div className="mt-8 divide-y divide-steel-800 border-y border-steel-800">
            {project.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-4 py-4 hover:text-paper"
              >
                <span className="text-sm text-steel-200">
                  {doc.label || doc.storageKey.split("/").pop()}
                </span>
                <span className="tech-label text-steel-400">
                  {doc.sizeBytes ? formatBytes(doc.sizeBytes) : "Download"} →
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
