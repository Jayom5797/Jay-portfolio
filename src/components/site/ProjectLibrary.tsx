"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/site/ProjectCard";
import { cn } from "@/lib/utils";
import type { CategoryDTO, ProjectDTO } from "@/lib/types";

/**
 * Client-side filter + search over the published projects. Built to scale to
 * many projects: filtering is O(n) over already-loaded records and the search
 * matches title, description, category, software and tags.
 */
export function ProjectLibrary({
  projects,
  categories,
}: {
  projects: ProjectDTO[];
  categories: CategoryDTO[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (activeCategory !== "all" && p.category?.slug !== activeCategory) return false;
      if (!q) return true;
      const haystack = [
        p.title,
        p.shortDescription,
        p.description,
        p.category?.name ?? "",
        ...p.software,
        ...p.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, query, activeCategory]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-6 border-b border-steel-800 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            count={projects.length}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              active={activeCategory === c.slug}
              onClick={() => setActiveCategory(c.slug)}
              count={c.projectCount}
            />
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full border border-steel-700 bg-ink-900 px-3 py-2 font-mono text-xs uppercase tracking-label text-paper placeholder:text-steel-500 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="tech-label">No matching projects</p>
          <p className="mt-2 text-sm text-steel-400">
            Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-3 py-1.5 font-mono text-[11px] uppercase tracking-label transition-colors",
        active
          ? "border-paper bg-paper text-ink"
          : "border-steel-700 text-steel-300 hover:border-steel-500 hover:text-paper",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span className={cn("ml-2", active ? "text-ink/60" : "text-steel-500")}>
          {count}
        </span>
      )}
    </button>
  );
}
