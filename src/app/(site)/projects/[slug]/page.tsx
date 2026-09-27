import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/ProjectDetail";
import { getAllPublishedSlugs, getPublishedProjectBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  // Pages are rendered dynamically; pre-generating params is a best-effort
  // optimization. If the DB isn't reachable at build time (e.g. on a fresh
  // Vercel build before the database is provisioned), don't fail the build.
  try {
    const slugs = await getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.shortDescription || undefined,
    openGraph: project.coverImage
      ? { images: [{ url: project.coverImage.url }] }
      : undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}
