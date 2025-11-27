// utils/hotkeys.ts
"use client";

export type HotkeyConfig = {
  openCourseSearch: string;   // ví dụ: "f"
  openReportCreate: string;   // ví dụ: "r"
};

export const HOTKEY_STORAGE_KEY = "student:hotkeys:v1";
export const HOTKEY_CHANGED_EVENT = "student:hotkeys:changed";

export const DEFAULT_HOTKEYS: HotkeyConfig = {
  openCourseSearch: "f",
  openReportCreate: "r",
};

export function loadHotkeysFromStorage(): HotkeyConfig {
  if (typeof window === "undefined") return DEFAULT_HOTKEYS;

  try {
    const raw = window.localStorage.getItem(HOTKEY_STORAGE_KEY);
    if (!raw) return DEFAULT_HOTKEYS;

    const parsed = JSON.parse(raw) as Partial<HotkeyConfig>;
    return {
      openCourseSearch:
        typeof parsed.openCourseSearch === "string" &&
        parsed.openCourseSearch.trim().length > 0
          ? parsed.openCourseSearch
          : DEFAULT_HOTKEYS.openCourseSearch,
      openReportCreate:
        typeof parsed.openReportCreate === "string" &&
        parsed.openReportCreate.trim().length > 0
          ? parsed.openReportCreate
          : DEFAULT_HOTKEYS.openReportCreate,
    };
  } catch {
    return DEFAULT_HOTKEYS;
  }
}

export function saveHotkeysToStorage(config: HotkeyConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOTKEY_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}
