"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/home", label: "Início" },
  { href: "/missoes", label: "Missões" },
  { href: "/feed", label: "Feed" },
  { href: "/ranking", label: "Ranking" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/30 bg-[#1a0a2e]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                active
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  : "text-purple-200 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
