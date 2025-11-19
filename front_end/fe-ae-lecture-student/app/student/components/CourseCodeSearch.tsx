// app/student/components/CourseCodeSearch.tsx
"use client";

import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { History, Loader2, Search, X } from "lucide-react";

import { useCourseByUniqueCode } from "@/hooks/course/useCourseByUniqueCode";
import {
  saveLastSearchedCourseFromResponse,
  loadLastSearchedCourses,
  type LastSearchedCourse,
} from "@/utils/secure-last-course-search";

function extractLecturerName(rawName?: string | null): string | null {
  if (!rawName) return null;
  const parts = rawName.split(" - ");
  if (parts.length < 2) return null;
  const lecturer = parts[parts.length - 1]?.trim();
  return lecturer || null;
}

export default function CourseCodeSearch() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const [recentCourses, setRecentCourses] = useState<LastSearchedCourse[]>([]);
  const [isClient, setIsClient] = useState(false); // cho portal

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { loading, searchByCode } = useCourseByUniqueCode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  // Load history 4 course gần nhất
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const list = await loadLastSearchedCourses();
        if (mounted && Array.isArray(list)) {
          setRecentCourses(list);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto focus khi mở
  useEffect(() => {
    if (open && inputRef.current) {
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent | KeyboardEventInit | any) => {
      if (e.key === "Escape") {
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKey as any);
    return () => window.removeEventListener("keydown", handleKey as any);
  }, [open, closePalette]);

  // Hotkey F mở palette (tránh khi đang gõ trong input/textarea/select)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent | KeyboardEventInit | any) => {
      const key = (e.key || "").toLowerCase();
      if (key !== "f") return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      if (!open) openPalette();
    };

    window.addEventListener("keydown", handleKey as any);
    return () => window.removeEventListener("keydown", handleKey as any);
  }, [open, openPalette]);

  // ===== Search logic =====
  const handleSelectCourse = useCallback(
    (course: LastSearchedCourse) => {
      if (!course?.id) return;
      closePalette();
      router.push(`/student/courses/search-by-code/${course.id}`);
    },
    [router, closePalette]
  );

  const handleSearch = useCallback(
    async (value?: string) => {
      const raw = value ?? code;
      const trimmed = raw.trim().toUpperCase();
      if (!trimmed || loading) return;

      const res = await searchByCode(trimmed);
      if (!res || !res.course) return;

      // Lưu + merge vào history (tối đa 4) rồi set lại state
      const updated = await saveLastSearchedCourseFromResponse(res);
      if (Array.isArray(updated)) {
        setRecentCourses(updated);
      }

      const newest = updated[0];
      if (newest) {
        handleSelectCourse(newest);
      }
    },
    [code, loading, searchByCode, handleSelectCourse]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleUseRecent = (course: LastSearchedCourse) => {
    if (!course?.uniqueCode) {
      handleSelectCourse(course);
      return;
    }
    setCode(course.uniqueCode.toUpperCase());
    handleSearch(course.uniqueCode);
  };

  // ===== Overlay JSX (portaled để phủ full màn) =====
  const overlay =
    open && isClient
      ? createPortal(
          <div className="fixed inset-0 z-[999]">
            {/* lớp tối nhẹ toàn màn (header + body cùng màu) */}
            <div
              className="absolute inset-0 bg-black/35"
              onClick={closePalette}
            />

            {/* Command palette style brand tím-trắng */}
            <div className="relative mx-auto flex justify-center pt-20 px-4">
              <div
                className="w-full max-w-2xl rounded-2xl bg-white/95 border border-[var(--border)] shadow-2xl overflow-hidden"
                style={{
                  boxShadow:
                    "0 18px 45px rgba(15,23,42,0.16), 0 0 0 1px rgba(148,163,184,0.12)",
                }}
              >
                {/* Input row */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-slate-50/70">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    ref={inputRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter course uniqueCode to find a class…"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  />
                  {loading && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  )}
                  <button
                    type="button"
                    onClick={closePalette}
                    className="p-1 rounded-md hover:bg-slate-200/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* List gợi ý */}
                <div className="max-h-72 overflow-y-auto py-1 bg-white">
                  {recentCourses.length > 0 && (
                    <div>
                      <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Recent
                      </div>

                      {recentCourses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleUseRecent(c)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(127,113,244,0.08)] text-[var(--brand)]">
                            <History className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Title: code + department */}
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">
                                {c.courseCode || c.uniqueCode}
                                {c.department ? ` · ${c.department}` : ""}
                              </span>
                              {c.uniqueCode && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(127,113,244,0.1)] text-[var(--brand)] font-semibold">
                                  {c.uniqueCode}
                                </span>
                              )}
                            </div>

                            {/* Subtitle: lecturer + enrolled */}
                            <div className="text-xs text-slate-500 truncate">
                              {(() => {
                                const lecturer = extractLecturerName(c.name);
                                const enrolledText = c.isEnrolled
                                  ? "Enrolled"
                                  : "Not enrolled";
                                if (lecturer) {
                                  return `Lecturer: ${lecturer} · ${enrolledText}`;
                                }
                                return enrolledText;
                              })()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {recentCourses.length === 0 && !code && (
                    <div className="px-4 py-4 text-xs text-slate-500">
                      Type a course uniqueCode (e.g.{" "}
                      <span className="font-mono text-slate-700">1VVRHT</span>)
                      and press <span className="font-semibold">Enter</span> to
                      jump to that class.
                    </div>
                  )}

                  {code && !loading && recentCourses.length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500">
                      Press <span className="font-semibold">Enter</span> to
                      search course{" "}
                      <span className="font-mono text-slate-700">{code}</span>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* Trigger trên header: có keycap F */}
      <button
        type="button"
        onClick={openPalette}
        className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1 shadow-sm text-xs text-slate-600 hover:bg-slate-200 transition-colors"
        style={{ minWidth: 260, maxWidth: 320 }}
      >
        <Search className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-left truncate text-slate-500">
          Search course by uniqueCode…
        </span>
        <span className="inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
          F
        </span>
      </button>

      {overlay}
    </>
  );
}
