import { db } from "./db";
import { mapProject } from "./mappers";
import type { CategoryDTO, ProjectDTO } from "./types";

const projectInclude = {
  category: true,
  coverImage: true,
  assets: true,
  caseStudy: true,
} as const;

/** All published projects, newest first. Public library. */
export async function getPublishedProjects(): Promise<ProjectDTO[]> {
  const rows = await db.project.findMany({
    where: { status: "PUBLISHED" },
    include: projectInclude,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(mapProject);
}

/** Published + featured projects for the homepage "Selected Projects". */
export async function getFeaturedProjects(limit = 6): Promise<ProjectDTO[]> {
  const rows = await db.project.findMany({
    where: { status: "PUBLISHED", featured: true },
    include: projectInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
  return rows.map(mapProject);
}

/**
 * A single published project by slug (public). Returns null if missing or not
 * published. Rendering is fully generic — no per-project logic anywhere.
 */
export async function getPublishedProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  const row = await db.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: projectInclude,
  });
  return row ? mapProject(row) : null;
}

/** Any project by slug regardless of status — used for admin preview. */
export async function getProjectBySlugAnyStatus(slug: string): Promise<ProjectDTO | null> {
  const row = await db.project.findUnique({
    where: { slug },
    include: projectInclude,
  });
  return row ? mapProject(row) : null;
}

/** Any project by id regardless of status — used by the admin editor. */
export async function getProjectById(id: string): Promise<ProjectDTO | null> {
  const row = await db.project.findUnique({
    where: { id },
    include: projectInclude,
  });
  return row ? mapProject(row) : null;
}

/** All projects (admin list). */
export async function getAllProjects(): Promise<ProjectDTO[]> {
  const rows = await db.project.findMany({
    include: projectInclude,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapProject);
}

export async function getAllCategories(): Promise<CategoryDTO[]> {
  const rows = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { projects: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    order: c.order,
    projectCount: c._count.projects,
  }));
}

/** Categories that have at least one published project (public filter). */
export async function getPublicCategories(): Promise<CategoryDTO[]> {
  const rows = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { projects: { where: { status: "PUBLISHED" } } } },
    },
  });
  return rows
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      order: c.order,
      projectCount: c._count.projects,
    }))
    .filter((c) => (c.projectCount ?? 0) > 0);
}

export async function getDashboardStats() {
  const [published, drafts, featured, total, categories] = await Promise.all([
    db.project.count({ where: { status: "PUBLISHED" } }),
    db.project.count({ where: { status: "DRAFT" } }),
    db.project.count({ where: { featured: true } }),
    db.project.count(),
    db.category.count(),
  ]);
  return { published, drafts, featured, total, categories };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const rows = await db.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** All media assets across projects (admin media overview). */
export async function getAllAssetsWithProject() {
  const rows = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, title: true, slug: true } } },
  });
  return rows.map((a) => ({
    id: a.id,
    kind: a.kind,
    label: a.label,
    url: a.url,
    storageKey: a.storageKey,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    createdAt: a.createdAt.toISOString(),
    project: a.project,
  }));
}
