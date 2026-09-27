"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  clearSiteAsset,
  updateSiteText,
  uploadSiteAsset,
} from "@/lib/actions/settings";
import { Field, inputClass } from "./Field";

type ImageField =
  | "profileImageUrl"
  | "profileImage2Url"
  | "fullBodyImageUrl"
  | "resumeUrl";

interface Settings {
  profileName: string;
  profileTitle: string;
  profileImageUrl: string;
  profileImage2Url: string;
  fullBodyImageUrl: string;
  resumeUrl: string;
  contactEmail: string;
  contactPhone: string;
  linkedinUrl: string;
  showPhone: boolean;
}

export function ProfileSettings({ settings }: { settings: Settings }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="tech-label text-accent-bright">Profile &amp; Contact</h2>
        <p className="mt-2 text-xs text-steel-500">
          These appear on the About, Contact and footer. Changes go live immediately.
        </p>
        <TextForm settings={settings} />
      </section>

      <section>
        <h2 className="tech-label text-accent-bright">Profile Images &amp; Résumé</h2>
        <p className="mt-2 text-xs text-steel-500">
          Upload or replace at any time — no redeploy needed.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <AssetSlot
            field="profileImageUrl"
            title="Primary headshot"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            kind="image"
            current={settings.profileImageUrl}
          />
          <AssetSlot
            field="profileImage2Url"
            title="Secondary headshot"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            kind="image"
            current={settings.profileImage2Url}
          />
          <AssetSlot
            field="fullBodyImageUrl"
            title="Full-body photo"
            accept=".jpg,.jpeg,.png,.webp,.avif"
            kind="image"
            current={settings.fullBodyImageUrl}
          />
          <AssetSlot
            field="resumeUrl"
            title="Résumé (PDF)"
            accept=".pdf"
            kind="pdf"
            current={settings.resumeUrl}
          />
        </div>
      </section>
    </div>
  );
}

function TextForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const onSubmit = (formData: FormData) => {
    setSaved(false);
    startTransition(async () => {
      await updateSiteText(formData);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form action={onSubmit} className="mt-5 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Display name">
          <input name="profileName" defaultValue={settings.profileName} className={inputClass} />
        </Field>
        <Field label="Title / role">
          <input name="profileTitle" defaultValue={settings.profileTitle} className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="contactEmail" type="email" defaultValue={settings.contactEmail} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="contactPhone" defaultValue={settings.contactPhone} className={inputClass} />
        </Field>
        <Field label="LinkedIn URL">
          <input name="linkedinUrl" defaultValue={settings.linkedinUrl} className={inputClass} />
        </Field>
        <label className="flex items-center gap-3 pt-7">
          <input
            type="checkbox"
            name="showPhone"
            defaultChecked={settings.showPhone}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm text-steel-200">Show phone number publicly</span>
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-paper px-5 py-2.5 font-mono text-xs uppercase tracking-label text-ink hover:bg-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save details"}
        </button>
        {saved && !pending && (
          <span className="font-mono text-[11px] uppercase tracking-label text-emerald-400">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

function AssetSlot({
  field,
  title,
  accept,
  kind,
  current,
}: {
  field: ImageField;
  title: string;
  accept: string;
  kind: "image" | "pdf";
  current: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const res = await uploadSiteAsset(field, file);
      if (!res.ok) setError(res.error ?? "Upload failed");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  };

  const onClear = () => {
    startTransition(async () => {
      await clearSiteAsset(field);
      router.refresh();
    });
  };

  return (
    <div className="border border-steel-800 bg-ink-900 p-4">
      <div className="flex items-center justify-between">
        <span className="tech-label">{title}</span>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="border border-steel-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-label text-paper hover:bg-ink-700 disabled:opacity-50"
          >
            {pending ? "…" : current ? "Replace" : "Upload"}
          </button>
          {current && (
            <button
              type="button"
              disabled={pending}
              onClick={onClear}
              className="font-mono text-[10px] uppercase tracking-label text-steel-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4">
        {current ? (
          kind === "image" ? (
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-steel-800 bg-ink-800">
              <Image src={current} alt={title} fill className="object-cover" sizes="200px" />
            </div>
          ) : (
            <a
              href={current}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-steel-800 bg-ink-800 px-4 py-3 text-sm text-steel-200 hover:text-paper"
            >
              <span>View current résumé</span>
              <span className="tech-label text-accent-bright">Open ↗</span>
            </a>
          )
        ) : (
          <div className="blueprint-grid grid aspect-[3/4] w-full place-items-center border border-steel-800">
            <span className="tech-label">None</span>
          </div>
        )}
      </div>
    </div>
  );
}
