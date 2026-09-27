/**
 * Upload the profile images + résumé to object storage and populate the
 * SiteSettings singleton so they're editable from the admin panel afterwards.
 * Idempotent: re-running overwrites the same site/ keys and updates the row.
 *
 * Run: npx tsx prisma/import-profile.ts
 */
import "dotenv/config";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { getStorage } from "../src/lib/storage";

const db = new PrismaClient();
const storage = getStorage();
const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

async function put(localName: string, key: string): Promise<string | null> {
  const abs = path.join(STORAGE_ROOT, localName);
  try {
    const data = await fs.readFile(abs);
    const ext = path.extname(localName).toLowerCase();
    const stored = await storage.put({
      key,
      data,
      mimeType: MIME[ext] ?? "application/octet-stream",
    });
    console.log(`  ✓ ${localName} → ${stored.url}`);
    return stored.url;
  } catch {
    console.log(`  ! ${localName} not found — skipped`);
    return null;
  }
}

async function main() {
  console.log("→ Uploading profile images + résumé…");

  const profileImageUrl = await put("jayprofile.png", "site/profile-1.png");
  const profileImage2Url = await put("jayprofile_2.png", "site/profile-2.png");
  const fullBodyImageUrl = await put("jayfullbody.png", "site/profile-fullbody.png");
  // Résumé already uploaded earlier as site/resume.pdf; keep that URL.
  const resumeUrl = `${(process.env.S3_PUBLIC_URL ?? "").replace(/\/+$/, "")}/site/resume.pdf`;

  const data: Record<string, string | boolean> = {
    profileName: process.env.NEXT_PUBLIC_PROFILE_NAME ?? "Jay Singh",
    profileTitle:
      process.env.NEXT_PUBLIC_PROFILE_TITLE ?? "Mechanical Design / CAD / Engineering",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
    linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
    showPhone: (process.env.NEXT_PUBLIC_SHOW_PHONE ?? "true").toLowerCase() !== "false",
    resumeUrl,
  };
  if (profileImageUrl) data.profileImageUrl = profileImageUrl;
  if (profileImage2Url) data.profileImage2Url = profileImage2Url;
  if (fullBodyImageUrl) data.fullBodyImageUrl = fullBodyImageUrl;

  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  console.log("→ SiteSettings populated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
