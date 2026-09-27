import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { getAllProjects } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div>
      <AdminHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"} in the library`}
        action={<ButtonLink href="/admin/projects/new">+ New Project</ButtonLink>}
      />

      <div className="p-8">
        {projects.length === 0 ? (
          <div className="border border-dashed border-steel-700 p-12 text-center">
            <p className="text-steel-300">No projects yet.</p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href="/admin/projects/new">+ New Project</ButtonLink>
            </div>
          </div>
        ) : (
          <div className="border border-steel-800">
            {/* Header row */}
            <div className="hidden grid-cols-[1fr_120px_100px_320px] gap-4 border-b border-steel-800 bg-ink-900 px-5 py-3 md:grid">
              <span className="tech-label">Project</span>
              <span className="tech-label">Status</span>
              <span className="tech-label">Featured</span>
              <span className="tech-label text-right">Actions</span>
            </div>

            <div className="divide-y divide-steel-800">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1fr_120px_100px_320px] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="truncate font-medium text-paper hover:text-accent-bright"
                    >
                      {p.title}
                    </Link>
                    <div className="tech-label mt-1">
                      /{p.slug} · {p.category?.name ?? "Uncategorized"} · {formatDate(p.updatedAt)}
                    </div>
                  </div>

                  <div>
                    <Badge tone={p.status === "PUBLISHED" ? "published" : "draft"}>
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <div>
                    {p.featured ? (
                      <Badge tone="featured">Yes</Badge>
                    ) : (
                      <span className="text-sm text-steel-500">No</span>
                    )}
                  </div>

                  <ProjectRowActions
                    id={p.id}
                    published={p.status === "PUBLISHED"}
                    featured={p.featured}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
