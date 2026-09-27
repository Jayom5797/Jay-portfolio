"use client";

import { useState } from "react";
import { textareaClass, inputClass } from "./Field";
import type { CaseStudySection } from "@/lib/types";

const SUGGESTED = [
  "Overview",
  "Design Challenge",
  "Design Approach",
  "Design Development",
  "Final Design",
  "Engineering Notes",
];

let uid = 0;

interface Section {
  key: number;
  heading: string;
  body: string;
}

/**
 * A repeatable list of case-study sections. Submits fields named
 * caseStudy[i][heading] / caseStudy[i][body] which the server action parses.
 */
export function CaseStudyEditor({ initial }: { initial: CaseStudySection[] }) {
  const [sections, setSections] = useState<Section[]>(
    initial.length > 0
      ? initial.map((s) => ({ key: uid++, heading: s.heading, body: s.body }))
      : [],
  );

  const add = (heading = "") =>
    setSections((prev) => [...prev, { key: uid++, heading, body: "" }]);

  const remove = (key: number) =>
    setSections((prev) => prev.filter((s) => s.key !== key));

  const move = (key: number, dir: -1 | 1) =>
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });

  const update = (key: number, patch: Partial<Section>) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      {sections.length === 0 && (
        <p className="text-sm text-steel-500">
          No case-study sections yet. Add sections like Overview, Design Challenge or
          Final Design to tell the story of this project.
        </p>
      )}

      {sections.map((s, i) => (
        <div key={s.key} className="border border-steel-800 bg-ink-900 p-4">
          <div className="flex items-center gap-2">
            <input
              name={`caseStudy[${i}][heading]`}
              value={s.heading}
              onChange={(e) => update(s.key, { heading: e.target.value })}
              placeholder="Section heading"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => move(s.key, -1)}
              className="px-2 py-1 font-mono text-xs text-steel-400 hover:text-paper"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(s.key, 1)}
              className="px-2 py-1 font-mono text-xs text-steel-400 hover:text-paper"
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(s.key)}
              className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
          <textarea
            name={`caseStudy[${i}][body]`}
            value={s.body}
            onChange={(e) => update(s.key, { body: e.target.value })}
            placeholder="Section content. Separate paragraphs with a blank line."
            className={`${textareaClass} mt-3`}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => add()}
          className="border border-steel-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-label text-paper hover:bg-ink-700"
        >
          + Add section
        </button>
        <span className="tech-label text-steel-600">or add a suggested section:</span>
        {SUGGESTED.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => add(label)}
            className="border border-steel-800 px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:border-steel-600 hover:text-paper"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
