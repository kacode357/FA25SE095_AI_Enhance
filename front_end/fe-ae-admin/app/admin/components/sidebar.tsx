"use client";

import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { mainNav } from "./admin-main-nav";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export default function ManagerSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  // ✅ mặc định mở section đầu tiên có children (Announcements)
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const firstWithChildren = mainNav.find((item) => item.children?.length);
    return firstWithChildren ? firstWithChildren.href : null;
  });

  // ✅ nếu đang ở trong 1 section có children -> auto mở section đó
  useEffect(() => {
    const activeWithChildren = mainNav.find(
      (item) => item.children && pathname?.startsWith(item.href)
    );

    if (activeWithChildren) {
      setOpenSection(activeWithChildren.href);
    }
  }, [pathname]);

  return (
    <div
      className={clsx(
        "h-full bg-white border-r border-[var(--border)] flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-20 border-b border-[var(--border)] flex items-center px-4">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-nav">
                Admin Panel
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Dashboard Management
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={() => setCollapsed(!collapsed)}
          size="icon"
          variant="ghost"
          className={clsx(
            "ml-auto rounded-full shadow-md hover:shadow-lg flex items-center justify-center h-10 w-10 cursor-pointer",
            "bg-gradient-to-br from-[var(--accent)] to-[var(--brand)] hover:opacity-90"
          )}
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
        <div className="space-y-3">
          {!collapsed && (
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Main
            </p>
          )}

          {mainNav.map(({ href, label, icon: Icon, description, children }) => {
            const hasChildren = !!children?.length;
            const anyChildActive =
              hasChildren && children!.some((c) => pathname === c.href);
            const isSectionActive = pathname === href || anyChildActive;
            const isOpen = hasChildren && openSection === href;

            // card chung (kích thước + radius giống nhau)
            const baseCardClasses = clsx(
              "relative flex items-center w-full transition-all duration-200 cursor-pointer",
              collapsed
                ? "justify-center h-12 rounded-2xl"
                : "h-16 rounded-2xl px-4 shadow-sm"
            );

            // style active/inactive dùng chung cho tất cả
            const cardActive =
              "bg-gradient-to-r from-[var(--brand)] to-[var(--brand-700)] text-white shadow-[0_16px_32px_rgba(127,113,244,0.45)]";
            const cardInactive =
              "bg-white text-nav hover:bg-[color-mix(in_oklab,var(--brand)_6%,#f8fafc)]";

            // ================== ITEM KHÔNG CÓ CHILDREN ==================
            if (!hasChildren) {
              return (
                <div key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      baseCardClasses,
                      isSectionActive ? cardActive : cardInactive
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      className={clsx(
                        "flex-shrink-0 w-5 h-5",
                        isSectionActive
                          ? "text-white"
                          : "text-[color:var(--text-muted)]"
                      )}
                    />

                    {!collapsed && (
                      <>
                        <div className="flex-1 min-w-0 ml-3 text-left">
                          <span
                            className={clsx(
                              "block text-sm font-semibold truncate",
                              isSectionActive ? "text-white" : "text-nav"
                            )}
                          >
                            {label}
                          </span>
                          {description && (
                            <span
                              className={clsx(
                                "block text-xs truncate",
                                isSectionActive
                                  ? "text-white/80"
                                  : "text-[color:var(--text-muted)]"
                              )}
                            >
                              {description}
                            </span>
                          )}
                        </div>

                        {isSectionActive && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-2 rounded-l-full bg-white/95 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
                        )}
                      </>
                    )}
                  </Link>
                </div>
              );
            }

            // ================== ITEM CÓ CHILDREN (2 LỚP) ==================
            return (
              <Collapsible
                key={href}
                open={isOpen}
                onOpenChange={(open) => setOpenSection(open ? href : null)}
                className="space-y-1"
              >
                {/* Tầng 1: card với mũi tên, màu inactive = cardInactive (giống Pending) */}
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={clsx(
                      baseCardClasses,
                      isSectionActive ? cardActive : cardInactive
                    )}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      className={clsx(
                        "flex-shrink-0 w-5 h-5",
                        isSectionActive
                          ? "text-white"
                          : "text-[color:var(--text-muted)]"
                      )}
                    />

                    {!collapsed && (
                      <>
                        <div className="flex-1 min-w-0 ml-3 text-left">
                          <span
                            className={clsx(
                              "block text-sm font-semibold truncate",
                              isSectionActive ? "text-white" : "text-nav"
                            )}
                          >
                            {label}
                          </span>
                          {description && (
                            <span
                              className={clsx(
                                "block text-xs truncate",
                                isSectionActive
                                  ? "text-white/80"
                                  : "text-[color:var(--text-muted)]"
                              )}
                            >
                              {description}
                            </span>
                          )}
                        </div>

                        {/* icon phân biệt menu 2 lớp */}
                        <ChevronRight
                          className={clsx(
                            "w-4 h-4 ml-2 transition-transform",
                            isSectionActive
                              ? "text-white"
                              : "text-[color:var(--text-muted)]",
                            isOpen ? "rotate-90" : "rotate-0"
                          )}
                        />

                        {/* stripe trắng bên phải */}
                        {isSectionActive && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-2 rounded-l-full bg-white/95 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
                        )}
                      </>
                    )}
                  </button>
                </CollapsibleTrigger>

                {/* Tầng 2: children, mặc định mở do state init */}
                {!collapsed && children && (
                  <CollapsibleContent className="mt-2 space-y-1 ml-4 border-l border-[color-mix(in_oklab,var(--brand)_18%,#e5e7eb)] pl-3">
                    {children.map((child) => {
                      const childActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={clsx(
                            "flex items-center text-xs rounded-xl px-3 py-2 transition-all cursor-pointer",
                            childActive
                              ? "bg-[color-mix(in_oklab,var(--brand)_18%,#eef2ff)] text-[var(--brand)] font-semibold shadow-[0_8px_20px_rgba(127,113,244,0.28)]"
                              : "text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_8%,#f8fafc)]"
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1.5 h-1.5 rounded-full mr-2",
                              childActive
                                ? "bg-[var(--brand)]"
                                : "bg-[color-mix(in_oklab,var(--brand)_40%,#e5e7eb)]"
                            )}
                          />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
