// app/student/courses/layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { BookOpen, BarChart3, Users, ListChecks, MessageSquare, FilePlus2 } from "lucide-react";
import { useEffect } from "react";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");

  const seg3 = segments.length >= 4 ? segments[3] : null;
  const isMyGroupsPage = seg3 === "my-groups";
  const courseId = seg3 && !isMyGroupsPage ? seg3 : null;

  const basePath = courseId ? `/student/courses/${courseId}` : "/student/courses";

  // ✅ đang ở /student/courses/[id]/assignments/[assignmentId]
  const isAssignmentDetailPage =
    segments.length >= 6 && segments[2] === "courses" && segments[4] === "assignments" && !!segments[5];

  const tabs = [
    { label: "Course", href: `${basePath}`, icon: BookOpen, visible: !!courseId },
    { label: "Groups", href: `${basePath}/groups`, icon: Users, visible: !!courseId },
    { label: "My Groups", href: `${basePath}/my-groups`, icon: ListChecks, visible: true },
    { label: "Grades", href: `${basePath}/grades`, icon: BarChart3, visible: !!courseId },
    { label: "Chat", href: `${basePath}/chat`, icon: MessageSquare, visible: !!courseId },
  ];

  const isTabActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Shortcut: R -> Create Report (chỉ khi KHÔNG ở assignment detail)
  useEffect(() => {
    if (!courseId || isAssignmentDetailPage) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (typing) return;
      if ((e.key === "r" || e.key === "R") && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push(`${basePath}/reports/create`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [courseId, basePath, router, isAssignmentDetailPage]);

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
          className="mx-auto flex items-center justify-between gap-6"
          style={{ maxWidth: 1280, padding: "8px 24px" }}
        >
          {/* Tabs (buttons) */}
          <div className="flex items-center gap-6">
            {tabs
              .filter((t) => t.visible)
              .map((tab) => {
                const Icon = tab.icon;
                const active = isTabActive(tab.href);
                return (
                  <button
                    key={tab.href}
                    type="button"
                    onClick={() => router.push(tab.href)}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "no-underline flex items-center gap-2 px-2 py-1.5 text-sm font-semibold transition-colors border-b-2 bg-transparent",
                      active
                        ? "text-nav-active border-brand"
                        : "text-nav hover:text-nav-active focus:text-nav-active border-transparent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
          </div>

          {/* Create Report CTA — ẨN khi đang ở assignment detail */}
          {courseId && !isAssignmentDetailPage && (
            <button
              type="button"
              className={clsx("btn btn-gradient", "hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm")}
              onClick={() => router.push(`${basePath}/reports/create`)}
              title="View Report (R)"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>View Report</span>
              <kbd className="ml-1 hidden md:inline-block rounded px-1 text-[10px]" style={{ background: "rgba(255,255,255,.2)" }}>
                R
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-16">{children}</div>
    </div>
  );
}
