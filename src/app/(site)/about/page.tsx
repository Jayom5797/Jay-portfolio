import type { Metadata } from "next";
import Image from "next/image";
import { profile } from "@/lib/profile";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: "About Jay — mechanical design and CAD engineer.",
};

export default function AboutPage() {
  return (
    <div className="content-wrap py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-[280px_1fr] md:gap-16">
        {/* Profile image */}
        <div className="md:sticky md:top-24 md:self-start">
          {profile.imageUrl ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-steel-800 bg-ink-900">
              <Image
                src={profile.imageUrl}
                alt={profile.name}
                fill
                sizes="(max-width: 768px) 100vw, 280px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="blueprint-grid grid aspect-[4/5] w-full place-items-center border border-steel-800">
              <span className="tech-label">Profile photo</span>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {profile.resumeUrl && (
              <div className="flex gap-2">
                <ButtonLink href={profile.resumeUrl} size="sm" target="_blank" rel="noreferrer">
                  View résumé
                </ButtonLink>
                <ButtonLink
                  href={profile.resumeUrl}
                  size="sm"
                  variant="secondary"
                  download
                >
                  Download
                </ButtonLink>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="max-w-2xl">
          <span className="tech-label text-accent-bright">About</span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-label text-steel-400">
            {profile.title}
          </p>

          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-steel-200">
            <p>
              {profile.name} is a mechanical design and CAD engineer working across
              mechanical systems, product design, assemblies and prototypes. Every
              project here is presented as an interactive 3D model so the geometry,
              fit and detail can be examined directly — not just described.
            </p>
            <p>
              This library is a living portfolio. New projects are added over time,
              each with its own model, technical information and case study covering
              the design challenge, the approach taken and the final result.
            </p>
          </div>

          <div className="mt-12 grid gap-8 border-t border-steel-800 pt-10 sm:grid-cols-2">
            <div>
              <span className="tech-label">Tools</span>
              <ul className="mt-3 space-y-1 text-sm text-steel-300">
                <li>SolidWorks</li>
                <li>Autodesk Inventor</li>
              </ul>
            </div>
            <div>
              <span className="tech-label">Focus</span>
              <ul className="mt-3 space-y-1 text-sm text-steel-300">
                <li>Mechanical design</li>
                <li>Product design</li>
                <li>Assemblies &amp; prototypes</li>
                <li>3D visualization</li>
              </ul>
            </div>
          </div>

          {/* Résumé inline viewer */}
          {profile.resumeUrl && (
            <div className="mt-12 border-t border-steel-800 pt-10">
              <div className="flex items-center justify-between">
                <span className="tech-label text-accent-bright">Résumé</span>
                <ButtonLink
                  href={profile.resumeUrl}
                  size="sm"
                  variant="ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in new tab ↗
                </ButtonLink>
              </div>
              <div className="mt-4 aspect-[1/1.294] w-full border border-steel-800 bg-ink-900 md:aspect-[1/0.9]">
                <object
                  data={`${profile.resumeUrl}#toolbar=0&navpanes=0`}
                  type="application/pdf"
                  className="h-full w-full"
                >
                  <div className="grid h-full place-items-center p-6 text-center">
                    <p className="text-sm text-steel-400">
                      Your browser can&apos;t display the PDF inline.{" "}
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-bright underline"
                      >
                        Open the résumé
                      </a>
                      .
                    </p>
                  </div>
                </object>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
