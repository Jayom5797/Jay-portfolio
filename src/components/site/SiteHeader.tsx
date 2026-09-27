"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-steel-800/80 bg-ink/80 backdrop-blur-md">
      <div className="content-wrap flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-steel-600 font-display text-sm font-bold">
            J
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold tracking-wide">JAY</span>
            <span className="tech-label mt-0.5 text-[9px]">Mechanical · CAD</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-xs uppercase tracking-label transition-colors",
                isActive(item.href) ? "text-paper" : "text-steel-400 hover:text-paper",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="tech-label md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-steel-800 md:hidden">
          <div className="content-wrap flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "py-3 font-mono text-xs uppercase tracking-label",
                  isActive(item.href) ? "text-paper" : "text-steel-400",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
