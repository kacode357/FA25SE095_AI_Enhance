// app/student/components/HotkeySettings.tsx
"use client";

import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";
import {
  DEFAULT_HOTKEYS,
  type HotkeyConfig,
  loadHotkeysFromStorage,
  saveHotkeysToStorage,
  HOTKEY_CHANGED_EVENT,
} from "@/utils/hotkeys";

function isInputLike(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable === true
  );
}

export default function HotkeySettings() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<HotkeyConfig>(DEFAULT_HOTKEYS);

  // load config từ localStorage
  useEffect(() => {
    const loaded = loadHotkeysFromStorage();
    setConfig(loaded);
  }, []);

  // persist khi config thay đổi + broadcast cho UI khác
  useEffect(() => {
    saveHotkeysToStorage(config);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(HOTKEY_CHANGED_EVENT, { detail: config })
      );
    }
  }, [config]);

  // global key listener -> phát custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // tránh khi đang gõ trong input/textarea...
      if (isInputLike(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = (e.key || "").toLowerCase();
      if (!key) return;

      if (key === config.openCourseSearch.toLowerCase()) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("student:hotkey:open-course-search")
        );
        return;
      }

      if (key === config.openReportCreate.toLowerCase()) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("student:hotkey:open-report-create")
        );
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config]);

  const handleCaptureKey =
    (field: keyof HotkeyConfig) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const key = (e.key || "").toLowerCase();

      // bỏ mấy phím control vớ vẩn
      if (
        key === "shift" ||
        key === "control" ||
        key === "alt" ||
        key === "meta" ||
        key === "os" ||
        key === "capslock" ||
        key === "tab"
      ) {
        return;
      }

      setConfig((prev) => ({
        ...prev,
        [field]: key,
      }));
    };

  return (
    <>
      {/* Floating button */}
       <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-500 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg backdrop-blur-sm hover:bg-slate-800 cursor-pointer"
    >
      <Keyboard className="h-4 w-4" />
      <span>Hotkeys</span>
    </button>

      {/* Panel cấu hình */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay click ra ngoài để đóng */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />

          {/* modal ở giữa màn hình */}
          <div
            className="relative pointer-events-auto w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">
                Hotkey settings
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4 text-xs text-slate-700">
              <p className="text-slate-500">
                Click on a field, then press any key to change the shortcut.
              </p>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Course search
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Open course search
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Open the course search palette from anywhere.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <input
                    type="text"
                    readOnly
                    onKeyDown={handleCaptureKey("openCourseSearch")}
                    value={config.openCourseSearch.toUpperCase()}
                    className="w-20 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Press any key to change
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Report page
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    Open report page
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Go to &quot;Create report&quot; for the current course.
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <input
                    type="text"
                    readOnly
                    onKeyDown={handleCaptureKey("openReportCreate")}
                    value={config.openReportCreate.toUpperCase()}
                    className="w-20 cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Press any key to change
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_HOTKEYS)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Reset to default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
