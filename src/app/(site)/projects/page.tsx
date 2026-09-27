import type { Metadata } from "next";
import { ProjectLibrary } from "@/components/site/ProjectLibrary";
import { getPublicCategories, getPublishedProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "The full library of Jay's mechanical engineering projects.",
};

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    getPublishedProjects(),
    getPublicCategories(),
  ]);

  return (
    <div className="content-wrap py-16 md:py-20">
      <header className="mb-10">
        <span className="tech-label text-accent-bright">Project Library</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Projects
        </h1>
        <p className="mt-4 max-w-xl text-steel-300">
          A growing library of mechanical design and CAD work. Filter by category
          or search to find a specific project.
        </p>
      </header>

      <ProjectLibrary projects={projects} categories={categories} />
    </div>
  );
}
