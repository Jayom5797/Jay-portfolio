import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Jay — mechanical design and CAD engineer.",
};

export default function AboutPage() {
  return (
    <div className="content-wrap py-16 md:py-24">
      <div className="max-w-3xl">
        <span className="tech-label text-accent-bright">About</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Mechanical design, built to be seen in 3D.
        </h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-steel-200">
          <p>
            Jay is a mechanical design and CAD engineer working across mechanical
            systems, product design, assemblies and prototypes. Every project here
            is presented as an interactive 3D model so the geometry, fit and detail
            can be examined directly — not just described.
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
      </div>
    </div>
  );
}
