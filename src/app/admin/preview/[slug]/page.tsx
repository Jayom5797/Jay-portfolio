import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectDetail } from "@/components/site/ProjectDetail";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getProjectBySlugAnyStatus } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Preview a project — including drafts — using the exact public project layout.
 * Admin-only (this route sits under /admin so middleware protects it).
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;
  const [project, profile] = await Promise.all([
    getProjectBySlugAnyStatus(slug),
    getProfile(),
  ]);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-ink">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-800/50 bg-amber-950/40 px-6 py-2 backdrop-blur">
        <span className="font-mono text-[11px] uppercase tracking-label text-amber-300">
          Preview · {project.status === "PUBLISHED" ? "Published" : "Draft"} —
          not necessarily public
        </span>
        <Link
          href={`/admin/projects/${project.id}`}
          className="font-mono text-[11px] uppercase tracking-label text-amber-200 hover:text-white"
        >
          ← Back to editor
        </Link>
      </div>

      <ProjectDetail project={project} />
      <SiteFooter profile={profile} />
    </div>
  );
}
