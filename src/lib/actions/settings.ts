"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStorage, buildAssetKey } from "@/lib/storage";

const SINGLETON_ID = "singleton";

export interface SettingsResult {
  ok: boolean;
  error?: string;
  url?: string;
}

type ImageField =
  | "profileImageUrl"
  | "profileImage2Url"
  | "fullBodyImageUrl"
  | "resumeUrl";

const FIELD_ACCEPT: Record<ImageField, string[]> = {
  profileImageUrl: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  profileImage2Url: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  fullBodyImageUrl: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  resumeUrl: [".pdf"],
};

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

async function ensureRow() {
  return db.siteSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

/** Upload a profile image or résumé and store its URL on the settings row. */
export async function uploadSiteAsset(
  field: ImageField,
  file: File,
): Promise<SettingsResult> {
  await requireUser();
  if (!file || file.size === 0) return { ok: false, error: "No file provided" };

  const ext = extOf(file.name);
  const allowed = FIELD_ACCEPT[field];
  if (ext && !allowed.includes(ext)) {
    return { ok: false, error: `Unsupported file type (${ext}).` };
  }

  await ensureRow();

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorage();
  // Stable-ish key under site/ with a cache-busting suffix per upload.
  const key = buildAssetKey("site", `${field}-${file.name}`).replace(
    "projects/site/",
    "site/",
  );
  const stored = await storage.put({
    key,
    data: buffer,
    mimeType: file.type || (ext === ".pdf" ? "application/pdf" : "application/octet-stream"),
  });

  await db.siteSettings.update({
    where: { id: SINGLETON_ID },
    data: { [field]: stored.url },
  });

  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, url: stored.url };
}

export async function uploadSiteAssetForm(formData: FormData): Promise<void> {
  const field = String(formData.get("field") ?? "") as ImageField;
  const file = formData.get("file");
  if (field && file instanceof File) {
    await uploadSiteAsset(field, file);
  }
}

/** Update text/contact/profile fields. */
export async function updateSiteText(formData: FormData): Promise<SettingsResult> {
  await requireUser();
  await ensureRow();

  await db.siteSettings.update({
    where: { id: SINGLETON_ID },
    data: {
      profileName: String(formData.get("profileName") ?? "").trim(),
      profileTitle: String(formData.get("profileTitle") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      contactPhone: String(formData.get("contactPhone") ?? "").trim(),
      linkedinUrl: String(formData.get("linkedinUrl") ?? "").trim(),
      showPhone: formData.get("showPhone") === "on" || formData.get("showPhone") === "true",
    },
  });

  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function updateSiteTextForm(formData: FormData): Promise<void> {
  await updateSiteText(formData);
}

/** Remove an image/résumé asset URL (clears the field). */
export async function clearSiteAsset(field: ImageField): Promise<SettingsResult> {
  await requireUser();
  await ensureRow();
  await db.siteSettings.update({
    where: { id: SINGLETON_ID },
    data: { [field]: "" },
  });
  revalidatePath("/about");
  revalidatePath("/admin/settings");
  return { ok: true };
}
