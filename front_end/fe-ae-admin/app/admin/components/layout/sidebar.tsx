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

  // Helper check xem URL có khớp logic cơ bản không
  const checkMatch = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true; // Giống y hệt
    if (href === '/admin') return false; // Dashboard không bắt nạt trang con
    return pathname.startsWith(`${href}/`); // Check trang detail
  };

  // State quản lý đóng mở
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Effect: Tự động tính toán section cần mở khi load trang
  useEffect(() => {
    if (!pathname) return;
    
    // Tìm section cha nào đang chứa trang hiện tại
    const activeParent = mainNav.find((item) => {
      // Check cha match
      if (checkMatch(item.href)) return true;
      // Check con match
      if (item.children) {
         return item.children.some(c => checkMatch(c.href));
      }
      return false;
    });

    if (activeParent) {
      setOpenSections((prev) => {
        if (prev.includes(activeParent.href)) return prev;
        return [...prev, activeParent.href];
      });
    }
  }, [pathname]);

  const toggleSection = (href: string) => {
    setOpenSections((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href]
    );
  };

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
              <span className="text-sm font-semibold text-nav">Admin Panel</span>
              <span className="text-xs text-[var(--text-muted)]">Dashboard Management</span>
            </div>
          )}
        </div>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          size="icon"
          variant="ghost"
          className="ml-auto rounded-full shadow-md bg-gradient-to-br from-[var(--accent)] to-[var(--brand)] text-white hover:opacity-90 h-10 w-10"
        >
          <ChevronRight className={clsx("transition-transform w-6 h-6", collapsed ? "rotate-0" : "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-3">
        {!collapsed && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Main</p>
        )}

        {mainNav.map(({ href, label, icon: Icon, description, children }) => {
          const hasChildren = !!children?.length;
          const isOpen = hasChildren && openSections.includes(href);

          // 🟢 LOGIC MỚI: TÌM ACTIVE CHILD CHUẨN XÁC
          // Mục đích: Chỉ cho phép 1 child active duy nhất dựa trên độ dài URL match
          let activeChildHref = "";
          if (hasChildren && pathname) {
            // Lọc ra những child khớp với URL hiện tại
            const matchingChildren = children!.filter(child => checkMatch(child.href));
            
            // Sắp xếp giảm dần theo độ dài href. 
            // -> "/admin/lecturers/pending-approval" (dài) sẽ đứng trước "/admin/lecturers" (ngắn)
            matchingChildren.sort((a, b) => b.href.length - a.href.length);

            // Lấy thằng đầu tiên (thằng dài nhất/cụ thể nhất)
            if (matchingChildren.length > 0) {
              activeChildHref = matchingChildren[0].href;
            }
          }

          // Parent active nếu chính nó active hoặc có con active
          const isSectionActive = checkMatch(href) || !!activeChildHref;

          // Style chung
          const baseCardClasses = clsx(
            "relative flex items-center w-full transition-all duration-200 cursor-pointer",
            collapsed ? "justify-center h-12 rounded-2xl" : "h-16 rounded-2xl px-4 shadow-sm"
          );
          const cardActive = "bg-gradient-to-r from-[var(--brand)] to-[var(--brand-700)] text-white shadow-[0_16px_32px_rgba(127,113,244,0.45)]";
          const cardInactive = "bg-white text-nav hover:bg-[color-mix(in_oklab,var(--brand)_6%,#f8fafc)]";

          // --- RENDER ITEM KHÔNG CÓ CHILDREN ---
          if (!hasChildren) {
            return (
              <Link
                key={href}
                href={href}
                className={clsx(baseCardClasses, isSectionActive ? cardActive : cardInactive)}
                title={collapsed ? label : undefined}
              >
                <Icon className={clsx("flex-shrink-0 w-5 h-5", isSectionActive ? "text-white" : "text-[color:var(--text-muted)]")} />
                {!collapsed && (
                  <div className="ml-3 overflow-hidden">
                    <span className={clsx("block text-sm font-semibold truncate", isSectionActive ? "text-white" : "text-nav")}>{label}</span>
                    {description && <span className={clsx("block text-xs truncate", isSectionActive ? "text-white/80" : "text-[color:var(--text-muted)]")}>{description}</span>}
                  </div>
                )}
                {isSectionActive && !collapsed && <div className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-2 rounded-l-full bg-white/95 shadow-glow" />}
              </Link>
            );
          }

          // --- RENDER ITEM CÓ CHILDREN (COLLAPSIBLE) ---
          return (
            <Collapsible key={href} open={isOpen} onOpenChange={() => toggleSection(href)} className="space-y-1">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={clsx(baseCardClasses, isSectionActive ? cardActive : cardInactive)}
                  title={collapsed ? label : undefined}
                >
                  <Icon className={clsx("flex-shrink-0 w-5 h-5", isSectionActive ? "text-white" : "text-[color:var(--text-muted)]")} />
                  {!collapsed && (
                    <>
                      <div className="flex-1 min-w-0 ml-3 text-left">
                        <span className={clsx("block text-sm font-semibold truncate", isSectionActive ? "text-white" : "text-nav")}>{label}</span>
                        {description && <span className={clsx("block text-xs truncate", isSectionActive ? "text-white/80" : "text-[color:var(--text-muted)]")}>{description}</span>}
                      </div>
                      <ChevronRight className={clsx("w-4 h-4 ml-2 transition-transform", isSectionActive ? "text-white" : "text-[color:var(--text-muted)]", isOpen ? "rotate-90" : "rotate-0")} />
                      {isSectionActive && <div className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-2 rounded-l-full bg-white/95 shadow-glow" />}
                    </>
                  )}
                </button>
              </CollapsibleTrigger>

              {!collapsed && children && (
                <CollapsibleContent className="mt-2 space-y-1 ml-4 border-l border-[color-mix(in_oklab,var(--brand)_18%,#e5e7eb)] pl-3">
                  {children.map((child) => {
                    // 🟢 SO SÁNH: Child này có phải là activeChildHref đã tính ở trên không?
                    const isChildActive = child.href === activeChildHref;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          "flex items-center text-xs rounded-xl px-3 py-2 transition-all cursor-pointer",
                          isChildActive
                            ? "bg-[color-mix(in_oklab,var(--brand)_18%,#eef2ff)] text-[var(--brand)] font-semibold shadow-[0_8px_20px_rgba(127,113,244,0.28)]"
                            : "text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_8%,#f8fafc)]"
                        )}
                      >
                        <span className={clsx("w-1.5 h-1.5 rounded-full mr-2", isChildActive ? "bg-[var(--brand)]" : "bg-[color-mix(in_oklab,var(--brand)_40%,#e5e7eb)]")} />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              )}
            </Collapsible>
          );
        })}
      </nav>
    </div>
  );
}