"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { projectInputSchema, parseList, slugify } from "@/lib/validation";
import { getStorage } from "@/lib/storage";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  projectId?: string;
  slug?: string;
}

/** Ensure a slug is unique, appending -2, -3, ... if needed. */
async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let candidate = base || "project";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.project.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

function extractProjectInput(formData: FormData) {
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  return projectInputSchema.safeParse({
    title,
    slug: rawSlug ? slugify(rawSlug) : slugify(title),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: (() => {
      const v = String(formData.get("categoryId") ?? "").trim();
      return v.length ? v : null;
    })(),
    tags: parseList(String(formData.get("tags") ?? "")),
    software: parseList(String(formData.get("software") ?? "")),
    materials: parseList(String(formData.get("materials") ?? "")),
    components: parseList(String(formData.get("components") ?? "")),
    tools: parseList(String(formData.get("tools") ?? "")),
    year: String(formData.get("year") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    dimensions: String(formData.get("dimensions") ?? "").trim(),
    projectType: String(formData.get("projectType") ?? "").trim(),
    status: (String(formData.get("status") ?? "DRAFT") === "PUBLISHED"
      ? "PUBLISHED"
      : "DRAFT") as "DRAFT" | "PUBLISHED",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    caseStudy: parseCaseStudy(formData),
  });
}

/** Case-study sections arrive as caseStudy[i][heading] / caseStudy[i][body]. */
function parseCaseStudy(formData: FormData) {
  const sections: { heading: string; body: string }[] = [];
  const headings = new Map<number, string>();
  const bodies = new Map<number, string>();
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^caseStudy\[(\d+)\]\[(heading|body)\]$/);
    if (!m) continue;
    const idx = Number(m[1]);
    if (m[2] === "heading") headings.set(idx, String(value));
    else bodies.set(idx, String(value));
  }
  const indices = Array.from(new Set([...headings.keys(), ...bodies.keys()])).sort(
    (a, b) => a - b,
  );
  for (const i of indices) {
    const heading = (headings.get(i) ?? "").trim();
    const body = bodies.get(i) ?? "";
    if (heading.length === 0 && body.trim().length === 0) continue;
    sections.push({ heading: heading || "Section", body });
  }
  return sections;
}

function serializeArrays(input: {
  tags: string[];
  software: string[];
  materials: string[];
  components: string[];
  tools: string[];
}) {
  return {
    tags: JSON.stringify(input.tags),
    software: JSON.stringify(input.software),
    materials: JSON.stringify(input.materials),
    components: JSON.stringify(input.components),
    tools: JSON.stringify(input.tools),
  };
}

/** Create a new project (draft by default). */
export async function createProject(formData: FormData): Promise<ActionResult> {
  await requireUser();
  const parsed = extractProjectInput(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const slug = await ensureUniqueSlug(data.slug);

  const project = await db.project.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId,
      ...serializeArrays(data),
      year: data.year,
      role: data.role,
      dimensions: data.dimensions,
      projectType: data.projectType,
      status: data.status,
      featured: data.featured,
      caseStudy: {
        create: data.caseStudy.map((s, i) => ({
          heading: s.heading,
          body: s.body,
          order: i,
        })),
      },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { ok: true, projectId: project.id, slug: project.slug };
}

/** Update an existing project. Case study is fully replaced from the form. */
export async function updateProject(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();
  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Project not found" };

  const parsed = extractProjectInput(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const slug = await ensureUniqueSlug(data.slug, id);

  await db.$transaction([
    db.caseStudySection.deleteMany({ where: { projectId: id } }),
    db.project.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        categoryId: data.categoryId,
        ...serializeArrays(data),
        year: data.year,
        role: data.role,
        dimensions: data.dimensions,
        projectType: data.projectType,
        status: data.status,
        featured: data.featured,
        caseStudy: {
          create: data.caseStudy.map((s, i) => ({
            heading: s.heading,
            body: s.body,
            order: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  return { ok: true, projectId: id, slug };
}

/** Toggle publication state. */
export async function setPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireUser();
  const project = await db.project.update({
    where: { id },
    data: { status: published ? "PUBLISHED" : "DRAFT" },
  });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return { ok: true, slug: project.slug };
}

export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireUser();
  await db.project.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/projects");
  return { ok: true };
}

/** Delete a project and all its assets (from storage too). */
export async function deleteProject(id: string): Promise<ActionResult> {
  await requireUser();
  const assets = await db.mediaAsset.findMany({ where: { projectId: id } });
  const storage = getStorage();
  await Promise.allSettled(assets.map((a) => storage.delete(a.storageKey)));
  await db.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  return { ok: true };
}

// ── Form-action wrappers (used directly by <form action={...}>) ────────────

export async function createProjectForm(formData: FormData) {
  const res = await createProject(formData);
  if (res.ok && res.projectId) {
    redirect(`/admin/projects/${res.projectId}?created=1`);
  }
  // On error, bounce back to the new-project page with a message.
  redirect(`/admin/projects/new?error=${encodeURIComponent(res.error ?? "Failed")}`);
}

export async function updateProjectForm(id: string, formData: FormData) {
  const res = await updateProject(id, formData);
  if (res.ok) {
    redirect(`/admin/projects/${id}?saved=1`);
  }
  redirect(`/admin/projects/${id}?error=${encodeURIComponent(res.error ?? "Failed")}`);
}
