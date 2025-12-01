"use client";

import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import {
  ChevronRight,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "./mainNav";

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
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <header className="h-20 border-b border-gray-200 flex items-center px-4">
        <div
          className={clsx(
            "flex items-center gap-2 w-full",
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
            size="icon"
            variant="ghost"
            className="rounded-full cursor-pointer bg-gradient-to-br from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:opacity-90 flex items-center justify-center h-10 w-10"
          >
            <ChevronRight
              className={clsx(
                "text-white transition-transform w-5 h-5",
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
          {mainNav.map((item) => {
            const { href, label, icon: Icon, description, children } = item as any;

            const isItemActive = (it: any): boolean => {
              if (!it) return false;
              if (it.href && pathname?.startsWith(it.href)) return true;
              if (it.children && it.children.length > 0) return it.children.some((c: any) => isItemActive(c));
              return false;
            };

            const active = isItemActive(item);

            const renderChildren = (items: any[], depth = 1) => {
              if (!items || items.length === 0) return null;
              return (
                <ul
                  className={clsx(
                    "mt-2 space-y-1 border-l border-blue-100",
                    depth === 1 ? "pl-2 ml-4 border-l border-blue-200" : "pl-2 ml-4"
                  )}
                >
                  {items.map((c) => {
                    const isThird = depth >= 2; // depth: 1 => second-level, 2 => third-level
                    let childActive = false;
                    if (isThird) {
                      // exact match for third-level items (avoid sibling both active)
                      childActive = pathname === c.href || (c.children && c.children.length > 0 && pathname?.startsWith(c.href));
                    } else {
                      if (c.children && c.children.length > 0) {
                        childActive = isItemActive(c);
                      } else {
                        childActive = pathname === c.href;
                      }
                    }

                    const linkBase = isThird
                      ? "flex items-center gap-2 text-xs rounded-md px-3 py-1.5 transition-all duration-200 relative"
                      : "flex items-center gap-3 text-sm rounded-md px-3 py-2 transition-all duration-200 relative";

                    const linkActiveClass = isThird
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "bg-gradient-to-r from-blue-50 to-white text-blue-700 font-semibold shadow-sm border-l-4 border-blue-500";

                    const linkInactiveClass = isThird
                      ? "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600";

                    return (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className={clsx(linkBase, childActive ? linkActiveClass : linkInactiveClass)}
                        >
                          {/* marker: vertical bar for level 1 children, small dot for level 2 (third-level) */}
                          {isThird ? (
                            <span
                              className={clsx(
                                "w-2 h-2 rounded-full mr-2 mt-1",
                                childActive ? "bg-blue-600" : "bg-gray-300"
                              )}
                            />
                          ) : (
                            <span
                              className={clsx(
                                "w-1 h-6 rounded mr-2 self-start mt-1",
                                childActive ? "bg-blue-600" : "bg-gray-300"
                              )}
                            />
                          )}

                          <span className={clsx("truncate", isThird ? "pl-1" : undefined)}>{c.label}</span>
                        </Link>

                        {/* Render nested children when this child is active */}
                        {c.children && c.children.length > 0 && childActive && renderChildren(c.children, depth + 1)}
                      </li>
                    );
                  })}
                </ul>
              );
            };

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={clsx(
                    "group flex items-center rounded-lg px-3 py-3 text-sm transition-all duration-200 relative",
                    collapsed ? "justify-center" : "gap-3",
                    active
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  )}
                >
                  <Icon
                    className={clsx(
                      "transition-transform group-hover:scale-110 flex-shrink-0 w-5 h-5",
                      active ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                    )}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex flex-col min-w-0">
                      <span
                        className={clsx(
                          "font-medium text-sm truncate",
                          active ? "text-white" : "group-hover:text-blue-600"
                        )}
                      >
                        {label}
                      </span>
                      {description && (
                        <p
                          className={clsx(
                            "text-xs mt-0.5 truncate",
                            active ? "text-white/80" : "text-gray-500 group-hover:text-blue-500"
                          )}
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  )}

                  {active && !collapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>

                {/* Render submenu only when parent is active (close if parent not selected) */}
                {!collapsed && children && children.length > 0 && active && renderChildren(children)}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
