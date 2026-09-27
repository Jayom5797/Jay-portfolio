import { z } from "zod";

/** Turn an arbitrary title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const stringArray = z.array(z.string().trim()).default([]);

export const caseStudySectionSchema = z.object({
  heading: z.string().trim().min(1, "Section heading is required"),
  body: z.string().default(""),
});

export const projectInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may contain lowercase letters, numbers and hyphens"),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  categoryId: z.string().nullable().default(null),
  tags: stringArray,
  software: stringArray,
  materials: stringArray,
  components: stringArray,
  tools: stringArray,
  year: z.string().default(""),
  role: z.string().default(""),
  dimensions: z.string().default(""),
  projectType: z.string().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  caseStudy: z.array(caseStudySectionSchema).default([]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  slug: z.string().trim().optional(),
  order: z.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

/** Parse a possibly comma/newline separated string into a clean string[]. */
export function parseList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
