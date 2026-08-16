import Link from "next/link";
import type { Profile } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PaletteTrigger } from "@/components/PaletteTrigger";

const NAV = [
  { href: "/", label: "Front" },
  { href: "/work", label: "Catalogue" },
  { href: "/about", label: "About" },
];

/**
 * A running head, not a navbar. Thin, opaque, ruled off from the page below —
 * the strip a newspaper prints at the top of every interior page.
 */
export function SiteHeader({ profile }: { profile: Profile }) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: "var(--paper)" }}
      data-print-hide
    >
      <div
        className="mx-auto flex items-center justify-between gap-4"
        style={{
          maxWidth: "var(--shell)",
          paddingInline: "var(--gutter)",
          height: "3.25rem",
        }}
      >
        <Link href="/" className="group flex items-baseline gap-2.5 min-w-0">
          <span
            className="display truncate"
            style={{ fontSize: "var(--t-md)", letterSpacing: "-0.01em" }}
          >
            {profile.shortName}
          </span>
          <span className="label hidden sm:inline truncate">{profile.role}</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <nav className="flex items-center gap-3 sm:gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="label transition-colors hover:text-[var(--accent)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span
            className="hidden sm:block"
            style={{ width: 1, height: "1rem", backgroundColor: "var(--rule)" }}
          />
          <PaletteTrigger />
          <ThemeToggle />
        </div>
      </div>
      <hr className="rule-thin" />
    </header>
  );
}
