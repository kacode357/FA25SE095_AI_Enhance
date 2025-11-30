"use client";

import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { mainNav } from "./admin-main-nav";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export default function ManagerSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  // ✅ section đang mở ở level 2 (vd: "/admin/announcements")
  const [openSection, setOpenSection] = useState<string | null>(null);

  // ✅ Lần đầu vào /admin/announcements/... thì auto mở section đó
  useEffect(() => {
    if (openSection) return;

    const activeWithChildren = mainNav.find(
      (item) => item.children && pathname?.startsWith(item.href)
    );

    if (activeWithChildren) {
      setOpenSection(activeWithChildren.href);
    }
  }, [pathname, openSection]);

  return (
    <div
      className={clsx(
        "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-20 border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Admin Panel
              </span>
              <span className="text-xs text-gray-500">
                Dashboard Management
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={() => setCollapsed(!collapsed)}
          size="icon"
          variant="ghost"
          className="ml-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:opacity-90 flex items-center justify-center h-10 w-10"
        >
          <ChevronRight
            className={clsx(
              "text-white transition-transform w-6 h-6",
              collapsed ? "rotate-0" : "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main
            </p>
          )}

          {mainNav.map(({ href, label, icon: Icon, description, children }) => {
            const hasChildren = !!children?.length;
            const isSectionActive = pathname?.startsWith(href);
            const isOpen = !collapsed && hasChildren && openSection === href;

            return (
              <div key={href} className="space-y-1">
                {/* Tầng 1 */}
                <Link
                  href={href}
                  className={clsx(
                    "group flex items-center rounded-lg transition-all duration-200 relative h-12 px-3",
                    collapsed ? "justify-center" : "gap-3",
                    isSectionActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    className={clsx(
                      "transition-transform group-hover:scale-110 flex-shrink-0 w-5 h-5",
                      isSectionActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-blue-600"
                    )}
                  />

                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span
                          className={clsx(
                            "font-medium text-sm truncate",
                            isSectionActive
                              ? "text-white"
                              : "group-hover:text-blue-600"
                          )}
                        >
                          {label}
                        </span>
                        {description && (
                          <p
                            className={clsx(
                              "text-xs mt-0.5 truncate",
                              isSectionActive
                                ? "text-white/80"
                                : "text-gray-500 group-hover:text-blue-500"
                            )}
                          >
                            {description}
                          </p>
                        )}
                      </div>

                      {/* ✅ nút mở/đóng level 2 (nếu có con) */}
                      {hasChildren && (
                        <button
                          title="Button"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenSection((prev) =>
                              prev === href ? null : href
                            );
                          }}
                          className="ml-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20"
                        >
                          <ChevronRight
                            className={clsx(
                              "h-4 w-4 text-white transition-transform",
                              isOpen ? "rotate-90" : "rotate-0"
                            )}
                          />
                        </button>
                      )}
                    </>
                  )}

                  {isSectionActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>

                {/* ✅ Tầng 2 – có thể đóng/mở */}
                {isOpen && children && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-gray-100 pl-3">
                    {children.map((child) => {
                      const childActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={clsx(
                            "flex items-center text-xs rounded-md px-2 py-1.5 transition-colors",
                            childActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1 h-1 rounded-full mr-2",
                              childActive ? "bg-blue-600" : "bg-gray-300"
                            )}
                          />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
