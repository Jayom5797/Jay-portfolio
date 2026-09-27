/**
 * One-off import: replace the trial projects with Jay's real projects.
 *
 * Reads local files staged under ./storage/projects/<folder> and imports them
 * through the SAME storage provider + data model the admin UI uses. Uploads
 * GLBs (primary model), images (cover + gallery, rotating on cards) and PDFs
 * (technical drawings) to object storage, then creates published project
 * records. Idempotent by slug. Also deletes the two trial projects and their
 * assets from the DB + storage.
 *
 * Run: npx tsx prisma/import-projects.ts
 */
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient, type AssetKind } from "@prisma/client";
import { getStorage, buildAssetKey } from "../src/lib/storage";
import { slugify } from "../src/lib/validation";

const db = new PrismaClient();
const storage = getStorage();

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "projects");

const MIME: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function mimeOf(file: string): string {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

// Trial projects to remove (slugs produced by slugify of the trial titles).
const TRIALS = ["86-blackout-ammo", "mi-ap-dv-1959"];

interface FileRef {
  /** absolute local path OR relative to STORAGE_ROOT */
  file: string;
  label?: string;
}

interface ImportProject {
  title: string;
  category: string;
  featured?: boolean;
  software?: string[];
  /** folder under storage/projects that holds the model + images */
  folder?: string;
  /** explicit model files (relative to folder) — else auto-detected .glb */
  models?: string[];
  /** explicit image files — else auto-detected images in folder */
  images?: string[];
  /** drawing PDFs (paths relative to storage/projects) */
  drawings?: FileRef[];
}

// ── The real projects ──────────────────────────────────────────────────────
const PROJECTS: ImportProject[] = [
  {
    title: "Drum Mechanism",
    category: "Mechanical Systems",
    featured: true,
    software: ["SolidWorks"],
    folder: "Drum_Mechanism",
  },
  {
    title: "Skid CIP",
    category: "Mechanical Systems",
    featured: true,
    software: ["SolidWorks"],
    folder: "SKID CIP",
  },
  {
    title: "Skid RO",
    category: "Mechanical Systems",
    featured: true,
    software: ["SolidWorks"],
    folder: "SKID RO",
  },
  {
    title: "Spidera",
    category: "Assemblies",
    featured: true,
    software: ["SolidWorks"],
    folder: "Spidera",
  },
  // 2D drafting projects (grouped) — PDFs shown as technical drawings.
  {
    title: "Fuze System — Draftings",
    category: "Product Design",
    software: ["SolidWorks"],
    drawings: [
      { file: "2d/FUZE FULL ASSEMBLY.pdf", label: "Fuze — Full Assembly" },
      { file: "2d/fuze components_merged.pdf", label: "Fuze — Components" },
      { file: "2d/81 MM HOLDER.pdf", label: "81 mm Holder" },
      { file: "2d/BASE HOLDER FOR PACKAGE_merged.pdf", label: "Base Holder for Package" },
    ],
  },
  {
    title: "DF — Draftings",
    category: "Product Design",
    software: ["SolidWorks"],
    drawings: [{ file: "2d/DF_merged.pdf", label: "DF — Drawings" }],
  },
];

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MODEL_EXT = [".glb", ".gltf"];

async function listFolder(folder: string): Promise<string[]> {
  const dir = path.join(STORAGE_ROOT, folder);
  try {
    return (await fs.readdir(dir)).filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

async function upload(localRel: string, slug: string, mime: string) {
  const abs = path.isAbsolute(localRel)
    ? localRel
    : path.join(STORAGE_ROOT, localRel);
  const data = await fs.readFile(abs);
  const key = buildAssetKey(slug, path.basename(localRel));
  const stored = await storage.put({ key, data, mimeType: mime });
  return { key: stored.key, url: stored.url, size: stored.sizeBytes };
}

async function deleteTrials() {
  for (const slug of TRIALS) {
    const project = await db.project.findUnique({
      where: { slug },
      include: { assets: true },
    });
    if (!project) continue;
    await Promise.allSettled(
      project.assets.map((a) => storage.delete(a.storageKey).catch(() => undefined)),
    );
    await db.project.delete({ where: { id: project.id } });
    console.log(`  ✗ Removed trial project "${project.title}"`);
  }
}

async function ensureCategory(name: string): Promise<string> {
  const slug = slugify(name);
  const cat = await db.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, order: 99 },
  });
  return cat.id;
}

async function importProject(p: ImportProject) {
  const slug = slugify(p.title);
  const existing = await db.project.findUnique({ where: { slug } });
  if (existing) {
    console.log(`  • "${p.title}" already exists — skipping`);
    return;
  }

  const categoryId = await ensureCategory(p.category);

  const assetCreates: {
    kind: AssetKind;
    label: string;
    storageKey: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    order: number;
  }[] = [];

  let coverKey: string | null = null;
  let coverUrl: string | null = null;
  let coverMime = "";
  let coverSize = 0;

  // ── Model folder (GLBs + images) ──────────────────────────────────────
  if (p.folder) {
    const files = await listFolder(p.folder);
    const modelFiles =
      p.models ?? files.filter((f) => MODEL_EXT.includes(path.extname(f).toLowerCase()));
    const imageFiles =
      p.images ?? files.filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()));

    let order = 0;
    for (const [i, m] of modelFiles.entries()) {
      const rel = path.join(p.folder, m);
      const up = await upload(rel, slug, mimeOf(m));
      assetCreates.push({
        kind: (i === 0 ? "MODEL_PRIMARY" : "MODEL_ADDITIONAL") as AssetKind,
        label: i === 0 ? "Primary model" : m,
        storageKey: up.key,
        url: up.url,
        mimeType: mimeOf(m),
        sizeBytes: up.size,
        order: order++,
      });
      console.log(`    ↑ model ${m} (${(up.size / 1024 / 1024).toFixed(1)} MB)`);
    }

    for (const [i, img] of imageFiles.entries()) {
      const rel = path.join(p.folder, img);
      const up = await upload(rel, slug, mimeOf(img));
      // First image becomes both the cover and a gallery image; the rest
      // are gallery images. Cards rotate through cover+gallery.
      assetCreates.push({
        kind: "GALLERY_IMAGE" as AssetKind,
        label: img,
        storageKey: up.key,
        url: up.url,
        mimeType: mimeOf(img),
        sizeBytes: up.size,
        order: i,
      });
      if (i === 0) {
        coverKey = up.key;
        coverUrl = up.url;
        coverMime = mimeOf(img);
        coverSize = up.size;
      }
      console.log(`    ↑ image ${img}`);
    }
  }

  // ── Drawings (PDFs) ───────────────────────────────────────────────────
  if (p.drawings) {
    for (const [i, d] of p.drawings.entries()) {
      const up = await upload(d.file, slug, mimeOf(d.file));
      assetCreates.push({
        kind: "DRAWING" as AssetKind,
        label: d.label ?? path.basename(d.file),
        storageKey: up.key,
        url: up.url,
        mimeType: mimeOf(d.file),
        sizeBytes: up.size,
        order: i,
      });
      console.log(`    ↑ drawing ${path.basename(d.file)}`);
    }
  }

  const project = await db.project.create({
    data: {
      title: p.title,
      slug,
      shortDescription: "",
      description: "",
      categoryId,
      software: JSON.stringify(p.software ?? []),
      tags: "[]",
      materials: "[]",
      components: "[]",
      tools: "[]",
      year: "",
      role: "",
      dimensions: "",
      projectType: "",
      status: "PUBLISHED",
      featured: p.featured ?? false,
      assets: { create: assetCreates },
    },
    include: { assets: true },
  });

  // Point coverImage at the first gallery image (if any).
  if (coverKey) {
    const cover = await db.mediaAsset.create({
      data: {
        kind: "COVER_IMAGE",
        label: "Cover",
        storageKey: coverKey,
        url: coverUrl!,
        mimeType: coverMime,
        sizeBytes: coverSize,
        order: 0,
        projectId: project.id,
      },
    });
    await db.project.update({
      where: { id: project.id },
      data: { coverImageId: cover.id },
    });
  }

  console.log(`  ✓ Imported "${p.title}" (${assetCreates.length} assets)`);
}

/**
 * Upload the profile image + résumé to object storage under a stable `site/`
 * prefix and print their public URLs so they can be set as NEXT_PUBLIC_* env
 * vars. Sources are configurable via env; defaults point at the Desktop files.
 */
async function importSiteAssets() {
  const profileSrc =
    process.env.PROFILE_IMAGE_SRC ?? "C:\\Users\\DELL\\Desktop\\jay\\jayfinal.png";
  const resumeSrc =
    process.env.RESUME_SRC ?? "C:\\Users\\DELL\\Desktop\\jay\\Jay Singh CV.pdf";

  const results: Record<string, string> = {};

  for (const [label, src, key] of [
    ["profile image", profileSrc, `site/profile${path.extname(profileSrc)}`],
    ["résumé", resumeSrc, `site/resume${path.extname(resumeSrc)}`],
  ] as const) {
    try {
      const data = await fs.readFile(src);
      const stored = await storage.put({ key, data, mimeType: mimeOf(src) });
      results[label] = stored.url;
      console.log(`  ✓ Uploaded ${label} → ${stored.url}`);
    } catch {
      console.log(`  ! ${label} not found at ${src} — skipped`);
    }
  }
  return results;
}

async function main() {
  console.log("→ Importing Jay's projects…");
  await deleteTrials();
  for (const p of PROJECTS) {
    await importProject(p);
  }
  console.log("→ Uploading site assets (profile image, résumé)…");
  const site = await importSiteAssets();

  const count = await db.project.count();
  console.log(`→ Done. ${count} projects in the library.`);

  if (site["profile image"] || site["résumé"]) {
    console.log("\nAdd these to .env (and Vercel):");
    if (site["profile image"])
      console.log(`NEXT_PUBLIC_PROFILE_IMAGE="${site["profile image"]}"`);
    if (site["résumé"]) console.log(`NEXT_PUBLIC_RESUME_URL="${site["résumé"]}"`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
