import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jay about mechanical design and CAD projects.",
};

export default function ContactPage() {
  return (
    <div className="content-wrap py-16 md:py-24">
      <div className="max-w-2xl">
        <span className="tech-label text-accent-bright">Contact</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Start a conversation.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-steel-300">
          Interested in a project, a collaboration, or a mechanical design
          challenge? Reach out and Jay will get back to you.
        </p>

        <div className="mt-10 divide-y divide-steel-800 border-y border-steel-800">
          <a
            href="mailto:jay@example.com"
            className="flex items-center justify-between py-5 hover:text-paper"
          >
            <span className="tech-label">Email</span>
            <span className="text-sm text-steel-200">jay@example.com</span>
          </a>
          <div className="flex items-center justify-between py-5">
            <span className="tech-label">Location</span>
            <span className="text-sm text-steel-200">Available worldwide</span>
          </div>
        </div>

        <p className="mt-8 text-xs text-steel-500">
          Contact details are placeholders and can be updated in the admin settings.
        </p>
      </div>
    </div>
  );
}
