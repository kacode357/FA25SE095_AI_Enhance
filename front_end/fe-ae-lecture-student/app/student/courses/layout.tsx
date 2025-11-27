// app/student/courses/layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BookOpen,
  BarChart3,
  Users,
  ListChecks,
  MessageSquare,
  FilePlus2,
  Headset,
  ListTodo,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadHotkeysFromStorage,
  HOTKEY_CHANGED_EVENT,
  type HotkeyConfig,
} from "@/utils/hotkeys";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const segments = pathname.split("/"); // ["", "student", "courses", "{courseId}", ...]
  const courseId = segments[3] || "";

  const basePath = `/student/courses/${courseId}`;

  const [reportHotkeyLabel, setReportHotkeyLabel] = useState<string>("");

  const tabs = [
    { label: "Course", href: `${basePath}`, icon: BookOpen },
    { label: "Assignments", href: `${basePath}/assignments`, icon: ListTodo },
    { label: "Groups", href: `${basePath}/groups`, icon: Users },
    { label: "My Groups", href: `${basePath}/my-groups`, icon: ListChecks },
    { label: "Grades", href: `${basePath}/grades`, icon: BarChart3 },
    { label: "Chat", href: `${basePath}/chat`, icon: MessageSquare },
    { label: "Support", href: `${basePath}/support`, icon: Headset },
  ];

  const isTabActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // 🔥 Nghe hotkey event "open report" (bắn từ HotkeySettings)
  useEffect(() => {
    if (!courseId) return;

    const handler = () => {
      router.push(`${basePath}/reports/create`);
    };

    window.addEventListener("student:hotkey:open-report-create", handler);
    return () => {
      window.removeEventListener("student:hotkey:open-report-create", handler);
    };
  }, [basePath, router, courseId]);

  // 🔥 Đọc hotkey hiện tại + subscribe khi user đổi trong HotkeySettings
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cfg = loadHotkeysFromStorage();
    setReportHotkeyLabel(cfg.openReportCreate.toUpperCase());

    const onHotkeyChanged = (e: Event) => {
      const ev = e as CustomEvent<HotkeyConfig>;
      if (!ev.detail) return;
      setReportHotkeyLabel(ev.detail.openReportCreate.toUpperCase());
    };

    window.addEventListener(HOTKEY_CHANGED_EVENT, onHotkeyChanged);
    return () => {
      window.removeEventListener(HOTKEY_CHANGED_EVENT, onHotkeyChanged);
    };
  }, []);

  return (
    <div className="flex flex-col">
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
          {/* Tabs */}
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.href);
              return (
                <button
                  key={tab.href}
                  type="button"
                  onClick={() => router.push(tab.href)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "no-underline flex items-center gap-2 px-2 py-1.5 text-sm font-semibold transition-colors border-b-2 bg-transparent cursor-pointer",
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

          {/* View Report button + hotkey label */}
          {courseId && (
            <button
              type="button"
              className={clsx(
                "btn btn-gradient cursor-pointer",
                "hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm"
              )}
              onClick={() => router.push(`${basePath}/reports/create`)}
              title={
                reportHotkeyLabel
                  ? `View Report (${reportHotkeyLabel})`
                  : "View Report"
              }
            >
              <FilePlus2 className="w-4 h-4" />
              <span>View Report</span>
              {reportHotkeyLabel && (
                <kbd
                  className="ml-1 hidden md:inline-block rounded px-1 text-[10px]"
                  style={{ background: "rgba(255,255,255,.2)" }}
                >
                  {reportHotkeyLabel}
                </kbd>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-16">{children}</div>
    </div>
  );
}
