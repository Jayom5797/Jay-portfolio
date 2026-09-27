"use client";

import Image from "next/image";
import { useState } from "react";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Lightbox-capable image gallery. Gracefully renders nothing if empty. */
export function Gallery({ images }: { images: Asset[] }) {
  const [active, setActive] = useState<Asset | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setActive(img)}
            className="group relative aspect-[4/3] overflow-hidden border border-steel-800 bg-ink-900"
          >
            <Image
              src={img.url}
              alt={img.label || "Project image"}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6"
          onClick={() => setActive(null)}
        >
          <div className="relative max-h-[90vh] max-w-5xl">
            <Image
              src={active.url}
              alt={active.label || "Project image"}
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto object-contain"
            />
            {active.label && (
              <p className="mt-3 text-center text-sm text-steel-300">{active.label}</p>
            )}
          </div>
          <button
            className={cn(
              "absolute right-6 top-6 border border-steel-600 px-3 py-1.5",
              "font-mono text-[10px] uppercase tracking-label text-steel-200 hover:text-paper",
            )}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
