"use client";

import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ChevronRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNav } from "./admin-main-nav";

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
        // slightly wider when collapsed so the purple gradient frame has more room
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header (match top header height so borders align) */}
      <div className="h-20 border-b border-gray-200 flex items-center">
        <div className="flex items-center justify-between w-full px-4">
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                Admin Panel
              </h2>
              <p className="text-sm text-gray-500 mt-1">Dashboard Management</p>
            </div>
          )}
          <Button
            onClick={() => setCollapsed(!collapsed)}
            size="icon"
            variant="ghost"
            // keep button size consistent so chevron doesn't visually jump
            className="rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:opacity-90 flex items-center justify-center h-10 w-10"
          >
            <ChevronRight
              className={clsx(
                "text-white transition-transform",
                // use a consistent chevron size (rotate based on collapsed)
                collapsed ? "w-6 h-6 rotate-0" : "w-6 h-6 rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main
            </p>
          )}

          {mainNav.map(({ href, label, icon: Icon, description, count }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "group flex items-center rounded-lg transition-all duration-200 relative",
                  // when collapsed: center the icon, align heights with chevron button, remove horizontal gap
                  // when collapsed: center the icon, increase horizontal padding so the purple frame is wider
                  collapsed ? "justify-center px-4 py-3 gap-0 h-12" : "gap-3 p-3 h-auto",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={clsx(
                    "transition-transform group-hover:scale-110 flex-shrink-0",
                    // reduce icon a bit when collapsed, keep default when expanded
                    collapsed ? "w-4 h-4" : "w-5 h-5",
                    active ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          "font-medium transition-colors text-sm",
                          active ? "text-white" : "group-hover:text-blue-600"
                        )}
                      >
                        {label}
                      </span>
                      {count && (
                        <span
                          className={clsx(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                    <p
                      className={clsx(
                        "text-xs mt-0.5 transition-colors",
                        active ? "text-white/80" : "text-gray-500 group-hover:text-blue-500"
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
      </nav>
    </div>
  );
}
