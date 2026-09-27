import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectFormFields } from "@/components/admin/ProjectFormFields";
import { ProjectFormActions } from "@/components/admin/ProjectFormActions";
import { createProjectForm } from "@/lib/actions/projects";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await getAllCategories();

  return (
    <div>
      <AdminHeader
        title="New Project"
        description="Create a project. Save as a draft first, then add media below after saving."
      />

      <div className="mx-auto max-w-3xl p-8">
        {error && (
          <p className="mb-6 border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mb-6 border border-steel-800 bg-ink-900 px-4 py-3 text-sm text-steel-300">
          Tip: uploads (3D model, cover, gallery, drawings, files) become available
          on the editor page once the project is saved.
        </div>

        <form action={createProjectForm}>
          <ProjectFormFields categories={categories} />
          <ProjectFormActions />
        </form>
      </div>
    </div>
  );
}
