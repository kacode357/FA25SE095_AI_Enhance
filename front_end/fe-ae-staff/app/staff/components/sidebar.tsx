"use client";

import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // --- LOGIC MỚI: Chỉ tự động mở menu cha của trang hiện tại ---
  useEffect(() => {
    if (!pathname) return;

    const newExpandedMap: Record<string, boolean> = {};

    // Hàm đệ quy check xem thằng nào cần mở
    const checkOpen = (items: any[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          // Check xem đường dẫn hiện tại có nằm trong thằng con nào của nó không
          const isChildActive = item.children.some((c: any) => 
            pathname === c.href || pathname.startsWith(c.href) || 
            (c.children && c.children.some((gc: any) => pathname.startsWith(gc.href)))
          );
          
          if (isChildActive) {
            newExpandedMap[item.href] = true;
          }
          // Tiếp tục check sâu hơn
          checkOpen(item.children);
        }
      });
    };

    checkOpen(mainNav as any[]);
    // Chỉ set lại map nếu object có dữ liệu để tránh re-render thừa, 
    // hoặc merge với state cũ nếu mày muốn giữ trạng thái các menu khác.
    // Ở đây tao set mới luôn cho đúng ngữ cảnh trang.
    setExpandedMap((prev) => ({ ...prev, ...newExpandedMap }));
    
  }, [pathname]); // Chạy lại khi đổi trang để tự mở menu tương ứng

  const toggleExpand = (href: string) => {
    setExpandedMap((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const toggleCollapsed = () => setCollapsed(!collapsed);

  // Helper: check if item or any descendant matches current pathname (for parent highlight)
  const isItemActive = (it: any): boolean => {
    if (!it) return false;
    const href: string | undefined = it.href;
    const selfActive = !!href && (pathname === href);
    if (selfActive) return true;
    if (it.children && it.children.length > 0) {
      return it.children.some((c: any) => isItemActive(c));
    }
    return false;
  };

  // Compute the unique active key: longest href that matches pathname
  const computeActiveKey = (items: any[]): string | undefined => {
    let key: string | undefined;
    let maxLen = -1;
    const visit = (arr: any[]) => {
      arr.forEach((it) => {
        if (typeof it.href === "string") {
          const href: string = it.href;
          if (pathname === href || (href !== "/staff" && pathname?.startsWith(href))) {
            if (href.length > maxLen) {
              key = href;
              maxLen = href.length;
            }
          }
        }
        if (it.children && it.children.length) visit(it.children);
      });
    };
    visit(items);
    return key;
  };

  const activeKey = computeActiveKey(mainNav as any[]);

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
                <p className="text-xs text-gray-500">Dashboard Management</p>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={toggleCollapsed}
            size="icon"
            variant="ghost"
            className="rounded-full cursor-pointer bg-linear-to-br from-blue-500 to-purple-500 shadow-md hover:shadow-lg hover:opacity-90 flex items-center justify-center h-10 w-10"
          >
            <ChevronRight
              className={clsx(
                "text-white transition-transform duration-500 w-5 h-5",
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
            const hasChildren = children && children.length > 0;
            const isExpanded = expandedMap[href];

            // Active if this item or any descendant matches
            const active = isItemActive(item);

            // --- FUNCTION RENDER CON ĐỆ QUY ---
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
                    const isThird = depth >= 2;
                    const childHasChildren = c.children && c.children.length > 0;
                    const childExpanded = expandedMap[c.href];
                    
                    // Mark a child active when it or any descendant matches the pathname
                    // (so parent entries like "Course Codes" show active when on a child route)
                    const childActive = isItemActive(c);

                    const linkBase = isThird
                      ? "flex items-center gap-2 text-xs rounded-md px-3 py-1.5 transition-all duration-200 relative"
                      : "flex items-center gap-3 text-sm rounded-md px-3 py-2 transition-all duration-200 relative";

                    const linkActiveClass = isThird
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "bg-gradient-to-r from-blue-50 to-white text-blue-700 font-semibold shadow-sm border-l-4 border-blue-500";

                    const linkInactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-blue-600";

                    return (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className={clsx(
                            linkBase,
                            childActive ? linkActiveClass : linkInactiveClass
                          )}
                        >
                          {/* Marker styling */}
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

                          <span className={clsx("truncate", isThird ? "pl-1" : undefined)}>
                            {c.label}
                          </span>

                          {/* Nút Toggle cho Menu Lớp 2 */}
                          {childHasChildren && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleExpand(c.href);
                              }}
                              aria-label={childExpanded ? "Collapse" : "Expand"}
                              className="ml-auto p-1 rounded cursor-pointer hover:bg-blue-100" // Thêm hover cho dễ nhìn
                            >
                              <ChevronRight
                                className={clsx(
                                  "w-3 h-3 transition-transform duration-300", // Giảm time animation cho mượt
                                  childExpanded ? "rotate-90" : "rotate-0",
                                  childActive ? "text-blue-700" : "text-gray-400"
                                )}
                              />
                            </button>
                          )}
                        </Link>

                        {/* --- KHU VỰC SỬA LỖI CHÍNH --- */}
                        {c.children && c.children.length > 0 && (
                          <div
                            className={clsx(
                              "overflow-hidden transition-all duration-500 ease-in-out",
                              // CHỈ DÙNG childExpanded, BỎ childActive đi
                              childExpanded ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                            )}
                          >
                            {renderChildren(c.children, depth + 1)}
                          </div>
                        )}
                        {/* ------------------------------ */}
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
                      ? "bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-700 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                  )}
                >
                  <Icon
                    className={clsx(
                      "transition-transform group-hover:scale-110 shrink-0 w-5 h-5",
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

                  {hasChildren && !collapsed && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand(href);
                      }}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      className="ml-2 p-1 rounded cursor-pointer hover:bg-white/20"
                    >
                      <ChevronRight
                        className={clsx(
                          "w-4 h-4 transition-transform duration-300",
                          isExpanded ? "rotate-90" : "rotate-0",
                          active ? "text-white" : "text-gray-400"
                        )}
                      />
                    </button>
                  )}

                  {active && !collapsed && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                  )}
                </Link>
                {!collapsed && children && children.length > 0 && (
                  <div
                    className={clsx(
                      "overflow-hidden transition-all duration-500 ease-in-out",
                      // CŨNG SỬA Ở ĐÂY: Chỉ dùng isExpanded
                      isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {renderChildren(children)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}