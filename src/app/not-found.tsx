import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="blueprint-grid grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <span className="tech-label text-accent-bright">404</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-steel-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            Projects
          </ButtonLink>
        </div>
        <Link href="/admin" className="tech-label mt-8 block text-steel-500 hover:text-steel-300">
          Admin →
        </Link>
      </div>
    </div>
  );
}
