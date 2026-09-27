import { env } from "../env";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import type { StorageProvider } from "./provider";

export type { StorageProvider, StoredObject } from "./provider";
export { LocalStorageProvider } from "./local";

let cached: StorageProvider | null = null;

/**
 * Returns the active storage provider based on STORAGE_PROVIDER.
 * The rest of the app depends only on the StorageProvider interface, so the
 * concrete provider can change without touching call sites.
 */
export function getStorage(): StorageProvider {
  if (cached) return cached;
  cached = env.storage.provider === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
  return cached;
}

/** Build a stable, collision-resistant storage key for an uploaded file. */
export function buildAssetKey(projectSlug: string, filename: string): string {
  const clean = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const folder = projectSlug || "unassigned";
  return `projects/${folder}/${stamp}-${rand}-${clean}`;
}
