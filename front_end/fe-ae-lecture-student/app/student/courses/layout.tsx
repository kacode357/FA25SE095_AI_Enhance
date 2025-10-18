"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, BarChart3 } from "lucide-react";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const courseId = segments.length >= 4 ? segments[3] : null;
  const basePath = courseId ? `/student/courses/${courseId}` : "/student/courses";

  const tabs = [
    { label: "Course", href: `${basePath}`, icon: BookOpen, visible: !!courseId },
    { label: "Grades", href: `${basePath}/grades`, icon: BarChart3, visible: !!courseId },
  ];

  return (
    <div className="flex flex-col">
      {/* ✅ Header phụ full-width, sticky khi cuộn */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-2">
          {tabs
            .filter((t) => t.visible)
            .map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(
                    "flex items-center gap-2 px-2 py-1.5 text-sm font-semibold transition-all",
                    isActive
                      ? "text-green-700 border-b-2 border-green-600"
                      : "text-slate-500 hover:text-green-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
        </div>
      </div>

      {/* ✅ Nội dung có padding hai bên */}
      <div className="container mx-auto px-4 mt-6">{children}</div>
    </div>
  );
}
