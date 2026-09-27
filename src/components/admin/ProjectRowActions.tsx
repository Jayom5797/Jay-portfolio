"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { deleteProject, setFeatured, setPublished } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

export function ProjectRowActions({
  id,
  published,
  featured,
}: {
  id: string;
  published: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => {
      await fn();
      router.refresh();
    });

  const onDelete = () => {
    if (!confirm("Delete this project? This also removes its uploaded assets and cannot be undone.")) {
      return;
    }
    run(() => deleteProject(id));
  };

  return (
    <div className={cn("flex items-center justify-end gap-1", pending && "opacity-50")}>
      <Link
        href={`/admin/projects/${id}`}
        className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-300 hover:text-paper"
      >
        Edit
      </Link>
      <button
        onClick={() => run(() => setFeatured(id, !featured))}
        disabled={pending}
        className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-accent-bright"
      >
        {featured ? "Unfeature" : "Feature"}
      </button>
      <button
        onClick={() => run(() => setPublished(id, !published))}
        disabled={pending}
        className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-emerald-300"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="px-2 py-1 font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-red-300"
      >
        Delete
      </button>
    </div>
  );
}
