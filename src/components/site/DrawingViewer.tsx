"use client";

import Image from "next/image";
import { useState } from "react";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders technical drawings inline. PDFs embed in a document viewer (with
 * open/download actions and a fullscreen toggle); images render inline.
 * When there are multiple drawings, a tab strip switches between them so the
 * viewer stays large instead of a wall of small links.
 */
export function DrawingViewer({ drawings }: { drawings: Asset[] }) {
  const [activeId, setActiveId] = useState(drawings[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const active = drawings.find((d) => d.id === activeId) ?? drawings[0];
  if (!active) return null;

  const isPdf = active.mimeType.includes("pdf") || active.url.toLowerCase().endsWith(".pdf");

  return (
    <div>
      {drawings.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {drawings.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={cn(
                "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-label transition-colors",
                d.id === active.id
                  ? "border-paper bg-paper text-ink"
                  : "border-steel-700 text-steel-300 hover:border-steel-500 hover:text-paper",
              )}
            >
              {d.label || "Drawing"}
            </button>
          ))}
        </div>
      )}

      <div className="border border-steel-800 bg-ink-900">
        <div className="flex items-center justify-between border-b border-steel-800 px-4 py-2">
          <span className="truncate text-sm text-steel-200">
            {active.label || "Technical drawing"}
          </span>
          <div className="flex items-center gap-3">
            {isPdf && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-paper"
              >
                {expanded ? "Shrink" : "Expand"}
              </button>
            )}
            <a
              href={active.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-paper"
            >
              Open ↗
            </a>
            <a
              href={active.url}
              download
              className="font-mono text-[10px] uppercase tracking-label text-accent-bright hover:text-paper"
            >
              Download
            </a>
          </div>
        </div>

        {isPdf ? (
          <object
            data={`${active.url}#toolbar=1&navpanes=0&view=FitH`}
            type="application/pdf"
            className={cn("w-full bg-white", expanded ? "h-[90vh]" : "h-[70vh]")}
          >
            {/* Fallback for browsers that won't embed PDFs (e.g. some mobile) */}
            <div className="grid place-items-center p-10 text-center">
              <p className="text-sm text-steel-400">
                This browser can&apos;t display the PDF inline.{" "}
                <a
                  href={active.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-bright underline"
                >
                  Open the drawing
                </a>
                .
              </p>
            </div>
          </object>
        ) : (
          <div className="relative aspect-[4/3] w-full bg-white">
            <Image
              src={active.url}
              alt={active.label || "Technical drawing"}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
