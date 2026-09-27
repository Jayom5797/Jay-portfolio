/**
 * Seed script.
 *
 * Creates the initial administrator, a default set of categories, and the two
 * initial projects. Crucially, the two seed projects are created through the
 * SAME storage + data path that every future project uses — they are NOT
 * special-cased anywhere. If the GLB source files are present they are copied
 * into object storage and attached as the primary model; if not, the projects
 * are still created (as drafts without a model) so Jay can upload the GLB from
 * the admin UI, exactly like any new project.
 *
 * No factual engineering specifications are invented — technical fields are
 * left as clearly-editable placeholders for Jay to complete.
 */
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient, type AssetKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getStorage, buildAssetKey } from "../src/lib/storage";
import { slugify } from "../src/lib/validation";

const db = new PrismaClient();

// Where the initial GLB files live. Override with SEED_MODELS_DIR if needed.
const MODELS_DIR =
  process.env.SEED_MODELS_DIR ?? "C:\\Users\\DELL\\Desktop\\jay\\props";

const DEFAULT_CATEGORIES = [
  "Mechanical Design",
  "Product Design",
  "Mechanical Systems",
  "Assemblies",
  "Prototypes",
  "Machines",
  "Other",
];

interface SeedProject {
  title: string;
  modelFile: string;
  categoryName: string;
  shortDescription: string;
  software: string[];
  featured: boolean;
}

// These are ONLY initial content. The fields below are deliberately generic /
// placeholder — Jay edits them in the admin UI. Nothing factual is invented.
const SEED_PROJECTS: SeedProject[] = [
  {
    title: "8.6 Blackout Ammo",
    modelFile: "8.6 Blackout Ammo.glb",
    categoryName: "Product Design",
    shortDescription:
      "Placeholder description — edit this project in the admin panel to add details.",
    software: ["SolidWorks"],
    featured: true,
  },
  {
    title: "MI-AP-DV-1959",
    modelFile: "MI-AP-DV-1959_COMBINED.glb",
    categoryName: "Assemblies",
    shortDescription:
      "Placeholder description — edit this project in the admin panel to add details.",
    software: ["SolidWorks"],
    featured: true,
  },
];

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("→ Seeding database…");

  // ── Admin user ──────────────────────────────────────────────────────────
  const email = (process.env.ADMIN_EMAIL ?? "jay@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const name = process.env.ADMIN_NAME ?? "Jay";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash, role: "admin" },
  });
  console.log(`  ✓ Admin user: ${email}`);

  // ── Categories ──────────────────────────────────────────────────────────
  const categoryByName = new Map<string, string>();
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const catName = DEFAULT_CATEGORIES[i];
    const cat = await db.category.upsert({
      where: { slug: slugify(catName) },
      update: {},
      create: { name: catName, slug: slugify(catName), order: i },
    });
    categoryByName.set(catName, cat.id);
  }
  console.log(`  ✓ ${DEFAULT_CATEGORIES.length} categories`);

  // ── Seed projects ─────────────────────────────────────────────────────
  const storage = getStorage();

  for (const sp of SEED_PROJECTS) {
    const slug = slugify(sp.title);

    // Skip if a project with this slug already exists (idempotent seed).
    const existing = await db.project.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  • Project "${sp.title}" already exists — skipping`);
      continue;
    }

    // Try to load and store the GLB via the storage provider.
    const srcPath = path.join(MODELS_DIR, sp.modelFile);
    let modelAsset: { key: string; url: string; size: number } | null = null;

    if (await fileExists(srcPath)) {
      const data = await fs.readFile(srcPath);
      const key = buildAssetKey(slug, sp.modelFile);
      const stored = await storage.put({
        key,
        data,
        mimeType: "model/gltf-binary",
      });
      modelAsset = { key: stored.key, url: stored.url, size: stored.sizeBytes };
      console.log(
        `  ✓ Stored model for "${sp.title}" (${(data.byteLength / 1024 / 1024).toFixed(1)} MB)`,
      );
    } else {
      console.log(
        `  ! Model file not found for "${sp.title}" at ${srcPath} — creating project without a model (upload it in admin).`,
      );
    }

    const project = await db.project.create({
      data: {
        title: sp.title,
        slug,
        shortDescription: sp.shortDescription,
        description: "",
        categoryId: categoryByName.get(sp.categoryName) ?? null,
        software: JSON.stringify(sp.software),
        tags: "[]",
        materials: "[]",
        components: "[]",
        tools: "[]",
        year: "",
        role: "",
        dimensions: "",
        projectType: "",
        // Publish only if a model is attached; otherwise leave as draft so
        // Jay completes it — same flow as any project.
        status: modelAsset ? "PUBLISHED" : "DRAFT",
        featured: sp.featured,
      },
    });

    if (modelAsset) {
      await db.mediaAsset.create({
        data: {
          kind: "MODEL_PRIMARY" as AssetKind,
          label: "Primary model",
          storageKey: modelAsset.key,
          url: modelAsset.url,
          mimeType: "model/gltf-binary",
          sizeBytes: modelAsset.size,
          order: 0,
          projectId: project.id,
        },
      });
    }

    console.log(`  ✓ Project "${sp.title}" (${project.status.toLowerCase()})`);
  }

  console.log("→ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
