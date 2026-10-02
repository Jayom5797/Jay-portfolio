import { NextRequest } from "next/server";
import { getStorage, LocalStorageProvider } from "@/lib/storage";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MIME_BY_EXT: Record<string, string> = {
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

function mimeFor(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

/**
 * Serves assets stored by the local provider. When STORAGE_PROVIDER=s3 the
 * public URLs point straight at object storage and this route is unused.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const storage = getStorage();
  if (!(storage instanceof LocalStorageProvider)) {
    return new Response("Not found", { status: 404 });
  }

  const { key: parts } = await ctx.params;
  const key = parts.map((p) => decodeURIComponent(p)).join("/");

  try {
    const buffer = await storage.read(key);
    const body = new Uint8Array(buffer);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": mimeFor(key),
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Asset not found", { status: 404 });
  }
}

/**
 * Direct upload target for the LOCAL storage provider (dev). Authenticated —
 * only an admin session may write. On S3, the browser PUTs to a presigned S3
 * URL instead and this handler is unused.
 */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const storage = getStorage();
  if (!(storage instanceof LocalStorageProvider)) {
    return new Response("Not found", { status: 404 });
  }

  const { key: parts } = await ctx.params;
  const key = parts.map((p) => decodeURIComponent(p)).join("/");

  const arrayBuffer = await req.arrayBuffer();
  await storage.write(key, Buffer.from(arrayBuffer));
  return new Response(null, { status: 200 });
}
