"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { uploadAsset, deleteAsset, updateAssetRotation } from "@/lib/actions/assets";
import { formatBytes } from "@/lib/utils";
import type { Asset } from "@/lib/types";
import type { AssetKind } from "@prisma/client";

interface SlotConfig {
  kind: AssetKind;
  title: string;
  accept: string;
  hint: string;
  multiple?: boolean;
  preview?: "image" | "none";
}

const SLOTS: SlotConfig[] = [
  {
    kind: "COVER_IMAGE",
    title: "Cover Image",
    accept: ".jpg,.jpeg,.png,.webp,.avif",
    hint: "Shown on cards and previews. Replacing sets a new cover.",
    preview: "image",
  },
  {
    kind: "MODEL_PRIMARY",
    title: "Primary 3D Model",
    accept: ".glb,.gltf",
    hint: "The main GLB/GLTF shown in the viewer.",
  },
  {
    kind: "MODEL_ALTERNATIVE",
    title: "Alternative / Exploded Models",
    accept: ".glb,.gltf",
    hint: "Optional additional GLB/GLTF variants.",
    multiple: true,
  },
  {
    kind: "GALLERY_IMAGE",
    title: "Gallery Images",
    accept: ".jpg,.jpeg,.png,.webp,.gif,.avif",
    hint: "Renders and photos.",
    multiple: true,
    preview: "image",
  },
  {
    kind: "DRAWING",
    title: "Technical Drawings",
    accept: ".jpg,.jpeg,.png,.webp,.pdf,.svg",
    hint: "Drawing images or PDFs.",
    multiple: true,
    preview: "image",
  },
  {
    kind: "VIDEO",
    title: "Videos",
    accept: ".mp4,.webm,.mov",
    hint: "Short walkthrough or turntable clips.",
    multiple: true,
  },
  {
    kind: "DOCUMENT",
    title: "Additional Files",
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.step,.stp,.iges,.igs,.dwg,.zip",
    hint: "STEP, PDFs, spec sheets, archives.",
    multiple: true,
  },
];

export function AssetManager({
  projectId,
  assets,
  coverImageId,
}: {
  projectId: string;
  assets: Asset[];
  coverImageId: string | null;
}) {
  return (
    <div className="space-y-6">
      {SLOTS.map((slot) => (
        <AssetSlot
          key={slot.kind}
          projectId={projectId}
          slot={slot}
          assets={assets.filter((a) => matchesSlot(a.kind, slot.kind))}
          coverImageId={coverImageId}
        />
      ))}
    </div>
  );
}

/** The Alternative slot also displays exploded/additional model kinds. */
function matchesSlot(assetKind: AssetKind, slotKind: AssetKind): boolean {
  if (slotKind === "MODEL_ALTERNATIVE") {
    return (
      assetKind === "MODEL_ALTERNATIVE" ||
      assetKind === "MODEL_EXPLODED" ||
      assetKind === "MODEL_ADDITIONAL"
    );
  }
  return assetKind === slotKind;
}

function AssetSlot({
  projectId,
  slot,
  assets,
  coverImageId,
}: {
  projectId: string;
  slot: SlotConfig;
  assets: Asset[];
  coverImageId: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const res = await uploadAsset(projectId, slot.kind, file);
        if (!res.ok) {
          setError(res.error ?? "Upload failed");
          break;
        }
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      await deleteAsset(id);
      router.refresh();
    });
  };

  return (
    <div className="border border-steel-800 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="tech-label">{slot.title}</span>
          <p className="mt-1 text-xs text-steel-500">{slot.hint}</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={slot.accept}
            multiple={slot.multiple}
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="border border-steel-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-label text-paper hover:bg-ink-700 disabled:opacity-50"
          >
            {pending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {assets.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <div key={a.id} className="border border-steel-800 bg-ink-800">
              {slot.preview === "image" && a.mimeType.startsWith("image") ? (
                <div className="relative aspect-[4/3] bg-ink-700">
                  <Image src={a.url} alt={a.label || "asset"} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-ink-700 px-3 text-center">
                  <span className="break-all font-mono text-[10px] text-steel-400">
                    {a.storageKey.split("/").pop()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="truncate font-mono text-[10px] text-steel-500">
                  {a.sizeBytes ? formatBytes(a.sizeBytes) : ""}
                  {coverImageId === a.id ? " · cover" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  disabled={pending}
                  className="font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>

              {a.kind.startsWith("MODEL_") && <RotationControls asset={a} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Orientation controls for a model asset — flip/rotate to fix bad exports. */
function RotationControls({ asset }: { asset: Asset }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rot, setRot] = useState({
    x: asset.rotationX,
    y: asset.rotationY,
    z: asset.rotationZ,
  });

  const save = (next: { x: number; y: number; z: number }) => {
    setRot(next);
    startTransition(async () => {
      await updateAssetRotation(asset.id, next);
      router.refresh();
    });
  };

  const step = (axis: "x" | "y" | "z", delta: number) =>
    save({ ...rot, [axis]: (((rot[axis] + delta) % 360) + 360) % 360 });

  const reset = () => save({ x: 0, y: 0, z: 0 });

  return (
    <div className="border-t border-steel-800 px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="tech-label text-[9px]">Orientation</span>
        <button
          type="button"
          onClick={() => step("x", 180)}
          disabled={pending}
          className="font-mono text-[9px] uppercase tracking-label text-accent-bright hover:text-paper"
        >
          Flip upright (X 180°)
        </button>
      </div>
      <div className="flex items-center gap-2">
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} className="flex items-center gap-1">
            <span className="font-mono text-[9px] uppercase text-steel-500">{axis}</span>
            <button
              type="button"
              onClick={() => step(axis, -90)}
              disabled={pending}
              className="border border-steel-700 px-1.5 font-mono text-[10px] text-steel-300 hover:text-paper"
            >
              −
            </button>
            <span className="w-8 text-center font-mono text-[10px] text-steel-400">
              {Math.round(rot[axis])}°
            </span>
            <button
              type="button"
              onClick={() => step(axis, 90)}
              disabled={pending}
              className="border border-steel-700 px-1.5 font-mono text-[10px] text-steel-300 hover:text-paper"
            >
              +
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="ml-auto font-mono text-[9px] uppercase tracking-label text-steel-500 hover:text-paper"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
