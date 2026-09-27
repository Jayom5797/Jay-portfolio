"use client";

import { useState } from "react";
import { ModelViewer } from "@/components/viewer/ModelViewer";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = {
  MODEL_PRIMARY: "Primary",
  MODEL_ALTERNATIVE: "Alternative",
  MODEL_EXPLODED: "Exploded",
  MODEL_ADDITIONAL: "Additional",
};

/**
 * Renders the main 3D viewer plus a switcher when a project has more than one
 * model (primary / alternative / exploded / additional). Generic — driven only
 * by the project's model assets.
 */
export function ProjectModels({ models }: { models: Asset[] }) {
  const [activeId, setActiveId] = useState(models[0]?.id);
  const active = models.find((m) => m.id === activeId) ?? models[0];

  if (!active) {
    return (
      <div className="blueprint-grid grid aspect-[16/10] place-items-center border border-steel-800">
        <span className="tech-label">No 3D model provided for this project</span>
      </div>
    );
  }

  return (
    <div>
      {/* Autoload the primary model — it's the central feature of the page. */}
      <ModelViewer key={active.id} url={active.url} autoLoad />

      {models.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={cn(
                "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-label transition-colors",
                m.id === active.id
                  ? "border-paper bg-paper text-ink"
                  : "border-steel-700 text-steel-300 hover:border-steel-500 hover:text-paper",
              )}
            >
              {m.label || KIND_LABEL[m.kind] || "Model"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
