"use client";

import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers3,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNav = [
  {
    href: "/staff/terms",
    label: "Terms",
    icon: GraduationCap,
    description: "Manage academic terms",
  },
  {
    href: "/staff/course-codes",
    label: "Course Codes",
    icon: Layers3,
    description: "Manage your course codes",
  },
  {
    href: "/staff/course-requests",
    label: "Course Requests",
    icon: FileText,
    description: "View and process course requests",
  },
  {
    href: "/staff/courses",
    label: "Courses",
    icon: GraduationCap,
    description: "Manage active courses and enrollments",
  },
  {
    href: "/staff/course-approvals",
    label: "Course Approvals",
    icon: FileText,
    description: "Review and approve pending courses",
  },
  {
    href: "/staff/support-requests",
    label: "Support Requests",
    icon: LifeBuoy,
    description: "Handle student support tickets",
  },
  {
    href: "/staff/enrollments",
    label: "Import Enrollments",
    icon: FileSpreadsheet,
    description: "Bulk import students via Excel",
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export default function ManagerSidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <aside
      className={clsx(
        "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <header className="p-4 py-4.5 border-b border-gray-200">
        <div
          className={clsx(
            "flex items-center gap-2",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Staff Panel
                </p>
                <p className="text-xs text-gray-500">
                  Dashboard Management
                </p>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={toggleCollapsed}
            className="p-1.5 rounded-md btn btn-gradient-slow text-white"
          >
            <ChevronRight
              className={clsx(
                "w-4 h-4 transition-transform",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </p>
        )}

        <ul className="space-y-2">
          {mainNav.map(({ href, label, icon: Icon, description }) => {
            const active = pathname?.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={clsx(
                    "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 relative",
                    collapsed ? "justify-center" : "gap-3",
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  )}
                >
                  <Icon
                    className={clsx(
                      "transition-transform group-hover:scale-110",
                      collapsed ? "w-6 h-6" : "w-5 h-5",
                      active
                        ? "text-white"
                        : "text-gray-500 group-hover:text-blue-600"
                    )}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex flex-col min-w-0">
                      <span
                        className={clsx(
                          "font-medium truncate",
                          active ? "text-white" : "group-hover:text-blue-600"
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={clsx(
                          "text-[11px] mt-0.5 truncate",
                          active
                            ? "text-white/80"
                            : "text-gray-500 group-hover:text-blue-500"
                        )}
                      >
                        {description}
                      </span>
                    </div>
                  )}

                  {active && !collapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
