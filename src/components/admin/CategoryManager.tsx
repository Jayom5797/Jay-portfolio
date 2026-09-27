"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createCategory, deleteCategory, renameCategory } from "@/lib/actions/categories";
import { inputClass } from "./Field";
import type { CategoryDTO } from "@/lib/types";

export function CategoryManager({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const onCreate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createCategory(formData);
      if (!res.ok) setError(res.error ?? "Failed to create category");
      else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  const onRename = (id: string, current: string) => {
    const name = prompt("Rename category", current);
    if (!name || name === current) return;
    startTransition(async () => {
      await renameCategory(id, name);
      router.refresh();
    });
  };

  const onDelete = (id: string, count: number) => {
    const msg =
      count > 0
        ? `Delete this category? ${count} project(s) will become uncategorized.`
        : "Delete this category?";
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl">
      <form ref={formRef} action={onCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <span className="tech-label mb-2 block">New category</span>
          <input name="name" placeholder="e.g. Mechanical Systems" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="border border-steel-600 px-4 py-2.5 font-mono text-xs uppercase tracking-label text-paper hover:bg-ink-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mt-3 border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-8 border border-steel-800">
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-steel-500">
            No categories yet. Add categories to organize the project library.
          </p>
        ) : (
          <div className="divide-y divide-steel-800">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-paper">{c.name}</span>
                  <span className="tech-label ml-3">
                    /{c.slug} · {c.projectCount ?? 0} project
                    {(c.projectCount ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRename(c.id, c.name)}
                    disabled={pending}
                    className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-300 hover:text-paper"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => onDelete(c.id, c.projectCount ?? 0)}
                    disabled={pending}
                    className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
