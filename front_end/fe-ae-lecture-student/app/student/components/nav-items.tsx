"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navs = [
  { label: "Home", href: "/home" },
  { label: "All Courses", href: "/all-courses" },
  { label: "My Courses", href: "/my-courses" },
];

export default function NavItems() {
  const pathname = usePathname();

  // ✅ Prefix tự động cho app student
  const basePrefix = "/student";
  const fullPath = (href: string) =>
    href.startsWith(basePrefix) ? href : `${basePrefix}${href}`;

  return (
    <div className="flex items-center gap-8">
      {navs.map((item) => {
        const fullHref = fullPath(item.href);
        const isActive = pathname.startsWith(fullHref);

        return (
          <Link
            key={item.href}
            href={fullHref}
            className={clsx(
              "relative text-[15px] font-semibold transition-all duration-200 hover:text-green-600",
              isActive ? "text-green-600" : "text-gray-600"
            )}
          >
            {item.label}
            {/* ✅ Underline bar */}
            <span
              className={clsx(
                "absolute left-0 -bottom-1 h-[2px] w-full rounded-full bg-green-500 transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0 hover:opacity-60"
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
