"use client";

import { Link, usePathname } from "@/i18n/navigation";

/** Header link marked as current when the page is under its section. */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className="nav-link" aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
