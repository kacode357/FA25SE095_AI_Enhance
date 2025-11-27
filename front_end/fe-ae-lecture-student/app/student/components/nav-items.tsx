"use client";

import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
};

const RAW_NAVS: NavItem[] = [
  { label: "Home",           href: "/home" },
  { label: "All Courses",    href: "/all-courses" },
  { label: "My Courses",     href: "/my-courses" },
  { label: "My Assignments", href: "/my-assignments" },
];

// Hook trả về nav đã chuẩn hoá: fullHref + isActive
export function useStudentNav() {
  const pathname = usePathname();
  const basePrefix = "/student";

  return RAW_NAVS.map((n) => {
    const fullHref = n.href.startsWith(basePrefix)
      ? n.href
      : `${basePrefix}${n.href}`;

    const isActive =
      pathname === fullHref || pathname.startsWith(`${fullHref}/`);

    return { ...n, href: fullHref, isActive };
  });
}
