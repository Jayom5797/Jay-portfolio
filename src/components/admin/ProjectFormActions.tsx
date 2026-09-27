"use client";

import { useRef } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

/**
 * The Save Draft / Publish / Preview controls. Sets the hidden `status` field
 * on the enclosing form before submitting so a single server action handles
 * both draft and published saves.
 */
export function ProjectFormActions({
  previewSlug,
  currentStatus,
}: {
  previewSlug?: string;
  currentStatus?: "DRAFT" | "PUBLISHED";
}) {
  const statusRef = useRef<HTMLInputElement>(null);

  const setStatus = (value: "DRAFT" | "PUBLISHED") => {
    if (statusRef.current) statusRef.current.value = value;
  };

  return (
    <div className="sticky bottom-0 z-10 mt-10 flex flex-wrap items-center gap-3 border-t border-steel-800 bg-ink/90 px-1 py-4 backdrop-blur">
      <input
        ref={statusRef}
        type="hidden"
        name="status"
        defaultValue={currentStatus ?? "DRAFT"}
      />

      <SubmitButton
        label="Save Draft"
        onClick={() => setStatus("DRAFT")}
        variant="secondary"
      />
      <SubmitButton
        label="Publish"
        onClick={() => setStatus("PUBLISHED")}
        variant="primary"
      />

      {previewSlug && (
        <Link
          href={`/admin/preview/${previewSlug}`}
          target="_blank"
          className="ml-auto border border-steel-700 px-5 py-2.5 font-mono text-xs uppercase tracking-label text-steel-200 hover:border-steel-400 hover:text-paper"
        >
          Preview ↗
        </Link>
      )}
    </div>
  );
}

function SubmitButton({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const base =
    "px-5 py-2.5 font-mono text-xs uppercase tracking-label transition-colors disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-paper text-ink hover:bg-white"
      : "border border-steel-600 text-paper hover:bg-ink-700";
  return (
    <button type="submit" onClick={onClick} disabled={pending} className={`${base} ${styles}`}>
      {pending ? "Saving…" : label}
    </button>
  );
}
