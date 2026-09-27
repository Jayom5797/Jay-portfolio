import type {
  Category,
  MediaAsset,
  Project,
  CaseStudySection as PrismaCaseStudySection,
} from "@prisma/client";
import type { Asset, ProjectDTO, TechnicalField } from "./types";

function parseStringArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === "string");
    return [];
  } catch {
    return [];
  }
}

export function mapAsset(a: MediaAsset): Asset {
  return {
    id: a.id,
    kind: a.kind,
    label: a.label,
    url: a.url,
    storageKey: a.storageKey,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    order: a.order,
  };
}

type ProjectWithRelations = Project & {
  category: Category | null;
  coverImage: MediaAsset | null;
  assets: MediaAsset[];
  caseStudy: PrismaCaseStudySection[];
};

export function mapProject(p: ProjectWithRelations): ProjectDTO {
  const assets = [...p.assets].sort((a, b) => a.order - b.order).map(mapAsset);

  const models = assets.filter((a) =>
    ["MODEL_PRIMARY", "MODEL_ALTERNATIVE", "MODEL_EXPLODED", "MODEL_ADDITIONAL"].includes(
      a.kind,
    ),
  );
  // Primary model always first.
  models.sort((a, b) => {
    if (a.kind === "MODEL_PRIMARY") return -1;
    if (b.kind === "MODEL_PRIMARY") return 1;
    return a.order - b.order;
  });

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    tags: parseStringArray(p.tags),
    software: parseStringArray(p.software),
    materials: parseStringArray(p.materials),
    components: parseStringArray(p.components),
    tools: parseStringArray(p.tools),
    year: p.year,
    role: p.role,
    dimensions: p.dimensions,
    projectType: p.projectType,
    status: p.status,
    featured: p.featured,
    coverImage: p.coverImage ? mapAsset(p.coverImage) : null,
    models,
    gallery: assets.filter((a) => a.kind === "GALLERY_IMAGE"),
    drawings: assets.filter((a) => a.kind === "DRAWING"),
    documents: assets.filter((a) => a.kind === "DOCUMENT"),
    videos: assets.filter((a) => a.kind === "VIDEO"),
    caseStudy: [...p.caseStudy]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ id: s.id, heading: s.heading, body: s.body, order: s.order })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/**
 * Build the ordered technical-info list for a project, skipping any field the
 * administrator has not supplied. Nothing is ever invented.
 */
export function technicalFields(p: ProjectDTO): TechnicalField[] {
  const fields: TechnicalField[] = [
    { label: "Software", value: p.software.join(", ") },
    { label: "Project type", value: p.projectType },
    { label: "Materials", value: p.materials.join(", ") },
    { label: "Components", value: p.components.join(", ") },
    { label: "Dimensions", value: p.dimensions },
    { label: "Status", value: p.status === "PUBLISHED" ? "Published" : "Draft" },
    { label: "Year", value: p.year },
    { label: "Role", value: p.role },
    { label: "Tools", value: p.tools.join(", ") },
  ];
  return fields.filter((f) => f.value.trim().length > 0);
}
