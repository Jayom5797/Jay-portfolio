import type { Metadata } from "next";
import { profile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jay about mechanical design and CAD projects.",
};

export default function ContactPage() {
  const rows: { label: string; value: string; href?: string }[] = [];
  if (profile.email)
    rows.push({ label: "Email", value: profile.email, href: `mailto:${profile.email}` });
  if (profile.phone && profile.showPhone)
    rows.push({
      label: "Phone",
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s+/g, "")}`,
    });
  if (profile.linkedin)
    rows.push({ label: "LinkedIn", value: "View profile", href: profile.linkedin });

  return (
    <div className="content-wrap py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="tech-label text-accent-bright">Contact</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Start a conversation.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-steel-300">
          Interested in a project, a collaboration, or a mechanical design
          challenge? Reach out and {profile.name} will get back to you.
        </p>

        {rows.length > 0 ? (
          <div className="mt-10 divide-y divide-steel-800 border-y border-steel-800">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-5">
                <span className="tech-label">{r.label}</span>
                {r.href ? (
                  <a
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel={r.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-sm text-steel-200 transition-colors hover:text-accent-bright"
                  >
                    {r.value}
                  </a>
                ) : (
                  <span className="text-sm text-steel-200">{r.value}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-steel-500">
            Contact details will appear here once configured.
          </p>
        )}
      </div>
    </div>
  );
}
