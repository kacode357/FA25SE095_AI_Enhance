"use client";

import Button from "@/components/ui/button";
import { clsx } from "clsx";
import {
  BarChart3,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers3,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const mainNav = [
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
    href: "/staff/enrollments",
    label: "Import Enrollments",
    icon: FileSpreadsheet,
    description: "Bulk import students via Excel",
  },
];

const secondaryNav = [
  { href: "/staff/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/staff/settings", label: "Settings", icon: Settings },
];

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
        <div
          className={clsx(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Staff Panel
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Dashboard Management
              </p>
            </div>
          )}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 cursor-pointer rounded-md btn btn-gradient-slow text-white hover:bg-gray-100 transition-colors"
          >
            <ChevronRight
              className={clsx(
                "w-4 h-4 text-white transition-transform", // Changed from text-white
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
                  "group flex items-center p-3 rounded-lg transition-all duration-200 relative",
                  collapsed ? "justify-center" : "gap-3", // Added conditional layout
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "transition-transform group-hover:scale-110",
                    collapsed ? "w-6 h-6" : "w-5 h-5", // Added conditional size
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-600"
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

                {active && !collapsed && (
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
                  "group flex items-center p-3 rounded-lg transition-all duration-200",
                  collapsed ? "justify-center" : "gap-3", // Added conditional layout
                  active
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "group-hover:scale-110 transition-transform",
                    collapsed ? "w-6 h-6" : "w-5 h-5" // Added conditional size
                  )}
                />
                {!collapsed && <span className="font-medium">{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}