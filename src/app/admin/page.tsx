import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAllProjects, getDashboardStats } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, projects] = await Promise.all([getDashboardStats(), getAllProjects()]);
  const recent = projects.slice(0, 5);

  const cards = [
    { label: "Published", value: stats.published },
    { label: "Drafts", value: stats.drafts },
    { label: "Featured", value: stats.featured },
    { label: "Categories", value: stats.categories },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Overview of your project library"
        action={<ButtonLink href="/admin/projects/new">+ New Project</ButtonLink>}
      />

      <div className="p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="border border-steel-800 bg-ink-900 p-5">
              <span className="tech-label">{c.label}</span>
              <div className="mt-2 font-display text-3xl font-semibold">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-steel-800 pb-3">
            <span className="tech-label">Recent Projects</span>
            <Link href="/admin/projects" className="tech-label text-steel-400 hover:text-paper">
              View all →
            </Link>
          </div>

          {recent.length > 0 ? (
            <div className="mt-2 divide-y divide-steel-800">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/projects/${p.id}`}
                  className="flex items-center justify-between gap-4 py-4 hover:bg-ink-900"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-paper">{p.title}</div>
                    <div className="tech-label mt-1">
                      {p.category?.name ?? "Uncategorized"} · Updated{" "}
                      {formatDate(p.updatedAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p.featured && <Badge tone="featured">Featured</Badge>}
                    <Badge tone={p.status === "PUBLISHED" ? "published" : "draft"}>
                      {p.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-steel-700 p-10 text-center">
              <p className="text-steel-300">No projects yet.</p>
              <p className="mt-1 text-sm text-steel-500">
                Create your first project to get started.
              </p>
              <div className="mt-5 flex justify-center">
                <ButtonLink href="/admin/projects/new">+ New Project</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
