"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buildAssetKey, getStorage } from "@/lib/storage";
import type { AssetKind } from "@prisma/client";

export interface UploadResult {
  ok: boolean;
  error?: string;
  assetId?: string;
  url?: string;
}

const KIND_ACCEPT: Record<AssetKind, string[]> = {
  MODEL_PRIMARY: [".glb", ".gltf"],
  MODEL_ALTERNATIVE: [".glb", ".gltf"],
  MODEL_EXPLODED: [".glb", ".gltf"],
  MODEL_ADDITIONAL: [".glb", ".gltf"],
  GALLERY_IMAGE: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
  DRAWING: [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".svg"],
  DOCUMENT: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".step", ".stp", ".iges", ".igs", ".dwg", ".zip"],
  VIDEO: [".mp4", ".webm", ".mov"],
  COVER_IMAGE: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
};

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/**
 * Upload a single asset and attach it to a project. The physical bytes go to
 * object storage; only metadata + public URL are recorded in the DB.
 */
export async function uploadAsset(
  projectId: string,
  kind: AssetKind,
  file: File,
  label = "",
): Promise<UploadResult> {
  await requireUser();

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, error: "Project not found" };

  if (!file || file.size === 0) return { ok: false, error: "No file provided" };

  const ext = extOf(file.name);
  const allowed = KIND_ACCEPT[kind];
  if (allowed && ext && !allowed.includes(ext)) {
    return { ok: false, error: `Unsupported file type for this slot (${ext}).` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorage();
  const key = buildAssetKey(project.slug, file.name);
  const stored = await storage.put({
    key,
    data: buffer,
    mimeType: file.type || "application/octet-stream",
  });

  // Determine order (append to end of same-kind assets).
  const count = await db.mediaAsset.count({ where: { projectId, kind } });

  const asset = await db.mediaAsset.create({
    data: {
      kind,
      label,
      storageKey: stored.key,
      url: stored.url,
      mimeType: stored.mimeType,
      sizeBytes: stored.sizeBytes,
      order: count,
      projectId,
    },
  });

  // Cover image is a single pointer — replace previous cover.
  if (kind === "COVER_IMAGE") {
    await db.project.update({
      where: { id: projectId },
      data: { coverImageId: asset.id },
    });
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return { ok: true, assetId: asset.id, url: stored.url };
}

/** Server-action form wrapper: reads kind + file + label from FormData. */
export async function uploadAssetForm(projectId: string, formData: FormData): Promise<void> {
  const kind = String(formData.get("kind") ?? "") as AssetKind;
  const label = String(formData.get("label") ?? "");
  const file = formData.get("file");
  if (file instanceof File) {
    await uploadAsset(projectId, kind, file, label);
  }
}

export async function deleteAsset(assetId: string): Promise<UploadResult> {
  await requireUser();
  const asset = await db.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return { ok: false, error: "Asset not found" };

  const storage = getStorage();
  await storage.delete(asset.storageKey).catch(() => undefined);

  // If it was a cover, clear the pointer.
  if (asset.projectId) {
    const proj = await db.project.findUnique({ where: { id: asset.projectId } });
    if (proj?.coverImageId === assetId) {
      await db.project.update({
        where: { id: asset.projectId },
        data: { coverImageId: null },
      });
    }
  }

  await db.mediaAsset.delete({ where: { id: assetId } });

  if (asset.projectId) {
    revalidatePath(`/admin/projects/${asset.projectId}`);
  }
  revalidatePath("/projects");
  return { ok: true };
}

export async function updateAssetLabel(assetId: string, label: string): Promise<UploadResult> {
  await requireUser();
  await db.mediaAsset.update({ where: { id: assetId }, data: { label } });
  return { ok: true };
}

/**
 * Update a model asset's orientation correction (degrees). Applied generically
 * by the 3D viewer so a flipped/rotated model can be corrected from admin.
 */
export async function updateAssetRotation(
  assetId: string,
  rotation: { x?: number; y?: number; z?: number },
): Promise<UploadResult> {
  await requireUser();
  const asset = await db.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return { ok: false, error: "Asset not found" };

  await db.mediaAsset.update({
    where: { id: assetId },
    data: {
      rotationX: rotation.x ?? asset.rotationX,
      rotationY: rotation.y ?? asset.rotationY,
      rotationZ: rotation.z ?? asset.rotationZ,
    },
  });

  if (asset.projectId) {
    revalidatePath(`/admin/projects/${asset.projectId}`);
    const proj = await db.project.findUnique({ where: { id: asset.projectId } });
    if (proj) revalidatePath(`/projects/${proj.slug}`);
  }
  revalidatePath("/");
  return { ok: true };
}
