"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/login/actions";

const nav = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-steel-800 bg-ink-900">
      <div className="flex h-16 items-center gap-3 border-b border-steel-800 px-5">
        <span className="grid h-8 w-8 place-items-center border border-steel-600 font-display text-sm font-bold">
          J
        </span>
        <div className="leading-none">
          <div className="font-display text-sm font-semibold">Admin</div>
          <div className="tech-label mt-1 text-[9px]">Project Library</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2.5 font-mono text-xs uppercase tracking-label transition-colors",
              active(item.href, item.exact)
                ? "bg-ink-700 text-paper"
                : "text-steel-400 hover:bg-ink-800 hover:text-paper",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-steel-800 p-3">
        <Link
          href="/"
          className="block px-3 py-2 font-mono text-[11px] uppercase tracking-label text-steel-400 hover:text-paper"
        >
          ↗ View site
        </Link>
        <form action={logoutAction}>
          <div className="px-3 pb-1 pt-3 text-xs text-steel-500">
            Signed in as{" "}
            <span className="text-steel-300">{userName}</span>
          </div>
          <button
            type="submit"
            className="mt-1 w-full px-3 py-2 text-left font-mono text-[11px] uppercase tracking-label text-steel-400 hover:text-red-300"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
