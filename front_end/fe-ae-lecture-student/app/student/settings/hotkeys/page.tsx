"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";

import {
  DEFAULT_HOTKEYS,
  type HotkeyConfig,
  loadHotkeysFromStorage,
  saveHotkeysToStorage,
  HOTKEY_CHANGED_EVENT,
} from "@/utils/hotkeys";

export default function StudentSettingsHotkeysPage() {
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
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <Keyboard className="h-4 w-4 text-brand" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-nav">Keyboard shortcuts</h1>
          <p className="text-xs text-muted-foreground">
            Customize quick actions like opening course search or report page.
          </p>
        </div>
      </div>

      {/* Main settings card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-6 sm:py-5 space-y-5">
        <p className="text-xs text-muted-foreground">
          Click on a field, then press any key to change the shortcut.
        </p>

        {/* Course search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Course search
            </div>
            <div className="text-sm font-medium text-nav">
              Open course search
            </div>
            <div className="text-[11px] text-muted-foreground">
              Open the course search palette from anywhere.
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <input
              type="text"
              readOnly
              onKeyDown={handleCaptureKey("openCourseSearch")}
              value={config.openCourseSearch.toUpperCase()}
              className="w-24 cursor-pointer rounded-md border border-[var(--border)] bg-slate-50 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide focus:border-slate-400 focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-muted-foreground">
              Press any key to change
            </span>
          </div>
        </div>

        <div className="h-px border-t border-dashed border-[var(--border)]" />

        {/* Report page */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Report page
            </div>
            <div className="text-sm font-medium text-nav">
              Open report page
            </div>
            <div className="text-[11px] text-muted-foreground">
              Go to &quot;Create report&quot; for the current course.
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <input
              type="text"
              readOnly
              onKeyDown={handleCaptureKey("openReportCreate")}
              value={config.openReportCreate.toUpperCase()}
              className="w-24 cursor-pointer rounded-md border border-[var(--border)] bg-slate-50 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide focus:border-slate-400 focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-muted-foreground">
              Press any key to change
            </span>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setConfig(DEFAULT_HOTKEYS)}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
