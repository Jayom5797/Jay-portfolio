import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectFormFields } from "@/components/admin/ProjectFormFields";
import { ProjectFormActions } from "@/components/admin/ProjectFormActions";
import { AssetManager } from "@/components/admin/AssetManager";
import { Badge } from "@/components/ui/Badge";
import { updateProjectForm } from "@/lib/actions/projects";
import { getAllCategories, getProjectById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, created, error } = await searchParams;

  const [project, categories] = await Promise.all([
    getProjectById(id),
    getAllCategories(),
  ]);
  if (!project) notFound();

  const updateWithId = updateProjectForm.bind(null, id);

  // Collect all assets (models + media) for the manager.
  const allAssets = [
    ...project.models,
    ...project.gallery,
    ...project.drawings,
    ...project.documents,
    ...project.videos,
    ...(project.coverImage ? [project.coverImage] : []),
  ];

  return (
    <div>
      <AdminHeader
        title="Edit Project"
        description={`/projects/${project.slug}`}
        action={
          <div className="flex items-center gap-2">
            {project.featured && <Badge tone="featured">Featured</Badge>}
            <Badge tone={project.status === "PUBLISHED" ? "published" : "draft"}>
              {project.status === "PUBLISHED" ? "Published" : "Draft"}
            </Badge>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl p-8">
        {(saved || created) && (
          <p className="mb-6 border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
            {created ? "Project created." : "Changes saved."}
          </p>
        )}
        {error && (
          <p className="mb-6 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Details form */}
        <form action={updateWithId}>
          <ProjectFormFields project={project} categories={categories} />
          <ProjectFormActions previewSlug={project.slug} currentStatus={project.status} />
        </form>

        {/* Media — uploads happen immediately, outside the details form */}
        <section className="mt-12 border-t border-steel-800 pt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="tech-label text-accent-bright">Media &amp; 3D Models</h2>
            <Link
              href={`/admin/preview/${project.slug}`}
              target="_blank"
              className="tech-label text-steel-400 hover:text-paper"
            >
              Preview project ↗
            </Link>
          </div>
          <AssetManager
            projectId={project.id}
            assets={allAssets}
            coverImageId={project.coverImage?.id ?? null}
          />
        </section>
      </div>
    </div>
  );
}
