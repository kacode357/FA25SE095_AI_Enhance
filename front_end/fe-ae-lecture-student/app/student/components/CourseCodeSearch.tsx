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
import {
  DEFAULT_HOTKEYS,
  loadHotkeysFromStorage,
   HOTKEY_CHANGED_EVENT,
    type HotkeyConfig,
} from "@/utils/hotkeys";

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
  const [isClient, setIsClient] = useState(false);
  const [hotkeyLabel, setHotkeyLabel] = useState(
    DEFAULT_HOTKEYS.openCourseSearch.toUpperCase()
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { loading, searchByCode } = useCourseByUniqueCode();

  // load hotkey ban đầu + subscribe thay đổi từ settings
  useEffect(() => {
    if (typeof window === "undefined") return;

    // lần đầu
    const cfg = loadHotkeysFromStorage();
    setHotkeyLabel(cfg.openCourseSearch.toUpperCase());

    // lắng nghe khi config thay đổi
    const onHotkeyChanged = (e: Event) => {
      const ev = e as CustomEvent<HotkeyConfig>;
      if (!ev.detail) return;
      setHotkeyLabel(ev.detail.openCourseSearch.toUpperCase());
    };

    window.addEventListener(HOTKEY_CHANGED_EVENT, onHotkeyChanged);
    return () => {
      window.removeEventListener(HOTKEY_CHANGED_EVENT, onHotkeyChanged);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // load last hotkey label để hiển thị trên header button
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cfg = loadHotkeysFromStorage();
    setHotkeyLabel(cfg.openCourseSearch.toUpperCase());
  }, []);

  // lắng nghe custom event mở palette
  useEffect(() => {
    const handler = () => {
      setOpen(true);
    };
    window.addEventListener("student:hotkey:open-course-search", handler);
    return () =>
      window.removeEventListener("student:hotkey:open-course-search", handler);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

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

  useEffect(() => {
    if (open && inputRef.current) {
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  // ESC để đóng palette
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

      try {
        const updated = await saveLastSearchedCourseFromResponse(res);

        if (Array.isArray(updated) && updated.length > 0) {
          setRecentCourses(updated);
          handleSelectCourse(updated[0]);
          return;
        }
      } catch {
        // ignore history error
      }

      if (res.course.id) {
        closePalette();
        router.push(`/student/courses/search-by-code/${res.course.id}`);
      }
    },
    [code, loading, searchByCode, handleSelectCourse, closePalette, router]
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

  const overlay =
    open && isClient
      ? createPortal(
          <div className="fixed inset-0 z-[999]">
            <div
              className="student-overlay-backdrop absolute inset-0"
              onClick={closePalette}
            />

            <div className="relative mx-auto flex justify-center pt-20 px-4">
              <div className="student-popover student-command-panel">
                {/* Input row */}
                <div className="student-command-input-row flex items-center gap-2 px-4 py-3 border-b">
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
                    className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* List gợi ý */}
                <div className="student-command-body max-h-72 overflow-y-auto py-1">
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
                          <div className="student-avatar-circle flex h-9 w-9 items-center justify-center">
                            <History className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">
                                {c.courseCode || c.uniqueCode}
                                {c.department ? ` · ${c.department}` : ""}
                              </span>
                              {c.uniqueCode && (
                                <span className="student-badge-pill px-1.5 py-0.5">
                                  {c.uniqueCode}
                                </span>
                              )}
                            </div>

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
                    <div className="px-4 py-4 text-xs student-text-muted">
                      Type a course uniqueCode (e.g.{" "}
                      <span className="font-mono text-slate-700">1VVRHT</span>)
                      and press <span className="font-semibold">Enter</span> to
                      jump to that class.
                    </div>
                  )}

                  {code && !loading && recentCourses.length === 0 && (
                    <div className="px-4 py-2 text-xs student-text-muted">
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
      {/* Trigger trên header */}
      <button
        type="button"
        onClick={openPalette}
        className="student-header-button hidden md:flex items-center gap-2 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        style={{ minWidth: 260, maxWidth: 320 }}
      >
        <Search className="w-4 h-4 text-slate-500" />
        <span className="flex-1 text-left truncate text-slate-500">
          Search course by uniqueCode…
        </span>
        <span className="student-header-keycap inline-flex items-center justify-center px-2 py-0.5">
          {hotkeyLabel}
        </span>
      </button>

      {overlay}
    </>
  );
}
