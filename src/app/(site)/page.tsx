import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ModelViewer } from "@/components/viewer/ModelViewer";
import { getFeaturedProjects, getPublishedProjects } from "@/lib/queries";
import type { ProjectDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, published] = await Promise.all([
    getFeaturedProjects(6),
    getPublishedProjects(),
  ]);

  // Hero features a real project model — prefer featured, else newest published.
  const heroProject: ProjectDTO | undefined = featured[0] ?? published[0];
  const heroModel = heroProject?.models.find((m) => m.kind === "MODEL_PRIMARY") ??
    heroProject?.models[0];

  // Selected projects: featured first, filled with recent published if sparse.
  const selected = (featured.length > 0 ? featured : published).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-steel-800">
        {/* Subtle blueprint backdrop + corner ticks for a technical frame */}
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink" />
        <div className="content-wrap relative grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent-bright" />
              <span className="tech-label text-accent-bright">
                Mechanical Design / CAD / Engineering
              </span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              Engineering,
              <br />
              designed in 3D.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-steel-300">
              Explore Jay&apos;s mechanical engineering work through interactive 3D
              models and detailed project case studies — from concept through final
              design.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/projects">View projects</ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                About Jay
              </ButtonLink>
            </div>
          </div>

          <div className="animate-fade-in-slow">
            {heroModel ? (
              <div>
                <ModelViewer
                  url={heroModel.url}
                  autoLoad
                  allowExplode={false}
                  rotation={[heroModel.rotationX, heroModel.rotationY, heroModel.rotationZ]}
                  className="aspect-square"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="tech-label">Featured · {heroProject?.title}</span>
                  {heroProject && (
                    <Link
                      href={`/projects/${heroProject.slug}`}
                      className="tech-label text-accent-bright hover:text-paper"
                    >
                      Open project →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="blueprint-grid grid aspect-square place-items-center border border-steel-800">
                <span className="tech-label">No published models yet</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Selected Projects ────────────────────────────────────────── */}
      <section className="content-wrap py-16 md:py-24">
        <SectionHeading
          index="01"
          title="Selected Projects"
          action={
            <Link
              href="/projects"
              className="tech-label text-steel-300 hover:text-paper"
            >
              All projects →
            </Link>
          }
        />

        {selected.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-steel-400">
            No projects have been published yet. Check back soon.
          </p>
        )}
      </section>

      {/* ── Approach strip ───────────────────────────────────────────── */}
      <section className="border-y border-steel-800 bg-ink-900">
        <div className="content-wrap grid gap-8 py-14 md:grid-cols-3">
          {[
            {
              k: "Precision",
              d: "Designs modeled to tight tolerances with manufacturability in mind.",
            },
            {
              k: "Visualization",
              d: "Every project presented as an interactive 3D model, not a flat image.",
            },
            {
              k: "Documentation",
              d: "Case studies capture the challenge, approach and final design.",
            },
          ].map((item, i) => (
            <div key={item.k}>
              <span className="tech-label text-accent-bright">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold">{item.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-400">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
