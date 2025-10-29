// app/student/courses/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, BarChart3, Users, ListChecks } from "lucide-react";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/");

  // ["", "student", "courses", "<course-id>|my-groups", ...]
  const seg3 = segments.length >= 4 ? segments[3] : null;
  const isMyGroupsPage = seg3 === "my-groups";
  const courseId = seg3 && !isMyGroupsPage ? seg3 : null;

  const basePath = courseId ? `/student/courses/${courseId}` : "/student/courses";

  const tabs = [
    { label: "Course", href: `${basePath}`, icon: BookOpen, visible: !!courseId },
    { label: "Groups", href: `${basePath}/groups`, icon: Users, visible: !!courseId },
    { label: "My Groups", href: `${basePath}/my-groups`, icon: ListChecks, visible: true },
    { label: "Grades", href: `${basePath}/grades`, icon: BarChart3, visible: !!courseId },
  ];

  // Active rule
  const isTabActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col">
      {/* Tabs Bar */}
      <div
        className="sticky z-30 backdrop-blur-sm"
        style={{
          top: "var(--app-header-h, 64px)",
          background: "rgba(255,255,255,0.9)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="mx-auto flex items-center gap-6"
          style={{ maxWidth: 1280, padding: "8px 24px" }}
        >
          {tabs.filter(t => t.visible).map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "no-underline flex items-center gap-2 px-2 py-1.5 text-sm font-semibold transition-colors border-b-2",
                  active
                    ? "text-nav-active border-brand"
                    : "text-nav hover:text-nav-active focus:text-nav-active border-transparent"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
         <div className="container mx-auto px-16">{children}</div>
    </div>
  );
}
