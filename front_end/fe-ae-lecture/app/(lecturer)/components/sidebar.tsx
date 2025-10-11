// app/(lecturer)/components/sidebar.tsx
"use client";

import Button from "@/components/ui/button";
import { clsx } from "clsx";
import {
  BarChart3,
  ChevronRight,
  GraduationCap,
  Layers3
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNav = [
  { href: "/manager/class", label: "Classes", icon: Layers3, description: "Create and manage classes, schedules, groups" },
  { href: "/manager/course", label: "Courses", icon: Layers3, description: "Create and manage courses" },
  { href: "/manager/assignment", label: "Assignments", icon: Layers3, description: "Create assignments, set deadlines and submission limits" },
  { href: "/manager/group", label: "Groups", icon: Layers3, description: "Approve topics, manage members, lock/unlock groups" },
  { href: "/manager/progress", label: "Progress", icon: BarChart3, description: "Monitor group activity, logs and edit history" },
  { href: "/manager/review", label: "Data Review", icon: Layers3, description: "Review and approve/reject data before analysis" },
  { href: "/manager/grading", label: "Grading", icon: GraduationCap, description: "Feedback and scoring" },
  { href: "/manager/export", label: "Export", icon: Layers3, description: "Download gradebooks and feedback" },
  { href: "/manager/communication", label: "Communication", icon: Layers3, description: "Announcements and messaging" },
  { href: "/manager/submissions", label: "Submissions", icon: Layers3, description: "Manage resubmissions and extensions" },
  { href: "/manager/quota", label: "Quota", icon: Layers3, description: "View and request class quota" },
];

const secondaryNav: any[] = [];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export default function ManagerSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Instructor
              </h2>
              <p className="text-sm text-gray-500 mt-1">Dashboard Management</p>
            </div>
          )}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRight
              className={clsx(
                "w-4 h-4 text-white transition-transform",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main
            </p>
          )}

          {mainNav.map(({ href, label, icon: Icon, description }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 relative",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    active ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          "font-medium transition-colors",
                          active ? "text-white" : "group-hover:text-blue-600"
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    <p
                      className={clsx(
                        "text-xs mt-0.5 transition-colors",
                        active
                          ? "text-white/80"
                          : "text-gray-500 group-hover:text-blue-500"
                      )}
                    >
                      {description}
                    </p>
                  </div>
                )}

                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 space-y-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Others
            </p>
          )}

          {secondaryNav.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {!collapsed && <span className="font-medium">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
