import Link from "next/link";
import Image from "next/image";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Badge } from "@/components/ui/Badge";
import { getAllAssetsWithProject } from "@/lib/queries";
import { formatBytes } from "@/lib/utils";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  MODEL_PRIMARY: "Model",
  MODEL_ALTERNATIVE: "Model (alt)",
  MODEL_EXPLODED: "Model (exploded)",
  MODEL_ADDITIONAL: "Model",
  GALLERY_IMAGE: "Image",
  DRAWING: "Drawing",
  DOCUMENT: "File",
  VIDEO: "Video",
  COVER_IMAGE: "Cover",
};

export default async function AdminMediaPage() {
  const assets = await getAllAssetsWithProject();
  const totalBytes = assets.reduce((sum, a) => sum + a.sizeBytes, 0);

  return (
    <div>
      <AdminHeader
        title="Media"
        description={`${assets.length} asset(s) · ${formatBytes(totalBytes)} · storage: ${env.storage.provider}`}
      />

      <div className="p-8">
        {assets.length === 0 ? (
          <p className="text-steel-400">
            No media uploaded yet. Add media from within a project&apos;s editor.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="border border-steel-800 bg-ink-900">
                {a.mimeType.startsWith("image") ? (
                  <div className="relative aspect-[4/3] bg-ink-800">
                    <Image src={a.url} alt={a.label || "asset"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="blueprint-grid flex aspect-[4/3] items-center justify-center px-3 text-center">
                    <span className="tech-label">{KIND_LABEL[a.kind] ?? "Asset"}</span>
                  </div>
                )}
                <div className="space-y-1 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge>{KIND_LABEL[a.kind] ?? a.kind}</Badge>
                    <span className="font-mono text-[10px] text-steel-500">
                      {formatBytes(a.sizeBytes)}
                    </span>
                  </div>
                  {a.project ? (
                    <Link
                      href={`/admin/projects/${a.project.id}`}
                      className="block truncate text-xs text-steel-300 hover:text-paper"
                    >
                      {a.project.title}
                    </Link>
                  ) : (
                    <span className="text-xs text-steel-500">Unattached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
