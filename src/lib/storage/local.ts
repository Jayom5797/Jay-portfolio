import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "../env";
import type { PutObjectInput, StorageProvider, StoredObject } from "./provider";

/**
 * Local-disk storage provider.
 *
 * Writes bytes to a git-ignored directory (default ./storage) that lives
 * OUTSIDE the app bundle. Bytes are served back to the browser through the
 * /api/assets/[...key] route, so large GLB files never bloat the JS bundle.
 *
 * This is the zero-setup default. For production, set STORAGE_PROVIDER=s3.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";
  private baseDir: string;

  constructor(baseDir = env.storage.localDir) {
    // Intentional: the local provider resolves an app-relative storage dir at
    // runtime. The ignore hint prevents Turbopack from tracing the whole
    // project into the server bundle over this dynamic path.
    this.baseDir = path.resolve(/* turbopackIgnore: true */ process.cwd(), baseDir);
  }

  private resolvePath(key: string): string {
    // Prevent path traversal: normalize and ensure it stays under baseDir.
    const safeKey = key.replace(/\\/g, "/").replace(/^\/+/, "");
    const full = path.resolve(this.baseDir, safeKey);
    if (!full.startsWith(this.baseDir)) {
      throw new Error("Invalid storage key (path traversal blocked)");
    }
    return full;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const full = this.resolvePath(input.key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, input.data);
    return {
      key: input.key,
      url: this.publicUrl(input.key),
      mimeType: input.mimeType,
      sizeBytes: input.data.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolvePath(key));
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "ENOENT") throw err; // idempotent on missing files
    }
  }

  publicUrl(key: string): string {
    const safeKey = key.replace(/\\/g, "/").replace(/^\/+/, "");
    return `/api/assets/${safeKey}`;
  }

  /** Used by the asset-serving route to read bytes back. */
  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolvePath(key));
  }
}
