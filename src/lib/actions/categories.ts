"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { slugify } from "@/lib/validation";

export interface CategoryResult {
  ok: boolean;
  error?: string;
}

export async function createCategory(formData: FormData): Promise<CategoryResult> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Category name is required" };

  const slug = slugify(String(formData.get("slug") ?? "") || name);

  const existing = await db.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) return { ok: false, error: "A category with that name or slug already exists" };

  const count = await db.category.count();
  await db.category.create({ data: { name, slug, order: count } });

  revalidatePath("/admin/categories");
  revalidatePath("/projects");
  return { ok: true };
}

export async function renameCategory(id: string, name: string): Promise<CategoryResult> {
  await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name is required" };
  await db.category.update({ where: { id }, data: { name: trimmed } });
  revalidatePath("/admin/categories");
  revalidatePath("/projects");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryResult> {
  await requireUser();
  // Projects keep existing; their categoryId is set to null via onDelete.
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/projects");
  return { ok: true };
}

// Form wrappers
export async function createCategoryForm(formData: FormData): Promise<void> {
  await createCategory(formData);
}
