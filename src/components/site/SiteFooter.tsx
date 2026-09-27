import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-steel-800">
      <div className="content-wrap flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="font-display text-lg font-semibold">Jay</div>
          <p className="mt-3 text-sm leading-relaxed text-steel-400">
            Mechanical design and CAD engineering, presented through interactive 3D
            models and technical case studies.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="tech-label">Explore</span>
            <Link href="/projects" className="text-sm text-steel-300 hover:text-paper">
              Projects
            </Link>
            <Link href="/about" className="text-sm text-steel-300 hover:text-paper">
              About
            </Link>
            <Link href="/contact" className="text-sm text-steel-300 hover:text-paper">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="tech-label">Studio</span>
            <span className="text-sm text-steel-300">SolidWorks</span>
            <span className="text-sm text-steel-300">Autodesk Inventor</span>
          </div>
        </div>
      </div>
      <div className="hairline">
        <div className="content-wrap flex items-center justify-between py-6">
          <span className="tech-label">© {year} Jay</span>
          <span className="tech-label">Engineering, designed in 3D</span>
        </div>
      </div>
    </footer>
  );
}
