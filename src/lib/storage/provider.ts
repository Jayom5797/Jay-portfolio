/**
 * Storage abstraction.
 *
 * Uploaded assets (GLB/GLTF, images, PDFs, videos) are NEVER stored in the
 * application source tree as the long-term architecture. Instead they go
 * through a provider that speaks in provider-agnostic `key`s and returns a
 * public `url`. Swapping providers (local disk -> S3/R2/GCS) requires only an
 * env change, no application code changes.
 */

export interface StoredObject {
  /** Provider-agnostic storage key, e.g. "projects/robotic-arm/model.glb". */
  key: string;
  /** Public URL the browser can fetch the bytes from. */
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PutObjectInput {
  key: string;
  data: Buffer;
  mimeType: string;
}

export interface UploadTarget {
  /** URL the browser PUTs the file bytes to directly. */
  uploadUrl: string;
  /** HTTP method for the upload (always PUT here). */
  method: "PUT";
  /** Headers the browser must send with the PUT. */
  headers: Record<string, string>;
  /** Provider-agnostic storage key the object will live under. */
  key: string;
  /** Public URL the object will be readable from after upload. */
  publicUrl: string;
}

export interface StorageProvider {
  readonly name: string;
  /** Store bytes under `key`, returning its public URL + metadata. */
  put(input: PutObjectInput): Promise<StoredObject>;
  /** Remove an object. Missing objects resolve successfully (idempotent). */
  delete(key: string): Promise<void>;
  /** Resolve the public URL for an existing key. */
  publicUrl(key: string): string;
  /**
   * Create a target the browser can upload a file to DIRECTLY, bypassing the
   * app server. This is how large files (big GLBs) are uploaded on serverless
   * hosts like Vercel, which cap request bodies at ~4.5 MB.
   */
  createUploadTarget(key: string, mimeType: string): Promise<UploadTarget>;
}
