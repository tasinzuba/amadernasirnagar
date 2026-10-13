import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

export function isActivePath(href: string, pathname: string | null): boolean {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** ডেস্কটপ মেনুর সার্ভার-সাইড সংস্করণ: NavMenu (ক্লায়েন্ট) লোড হওয়ার আগের ফলব্যাক */
export function NavLinks({ items, pathname }: { items: readonly NavItem[]; pathname: string | null }) {
  return (
    <nav aria-label="প্রধান মেনু" className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActivePath(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap px-3.5 py-2 text-[1.0625rem] transition-colors ${
              active ? "font-semibold text-accent-600" : "text-brand-900 hover:text-accent-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
