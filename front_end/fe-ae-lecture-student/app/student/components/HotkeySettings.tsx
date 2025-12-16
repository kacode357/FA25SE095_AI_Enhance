// app/student/components/HotkeySettings.tsx
"use client";

import { useEffect, useState } from "react";
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
  const [config, setConfig] = useState<HotkeyConfig>(DEFAULT_HOTKEYS);

  // load config từ localStorage
  useEffect(() => {
    const loaded = loadHotkeysFromStorage();
    setConfig(loaded);

    // listen khi config thay đổi từ nơi khác
    const handleHotkeyChanged = (e: Event) => {
      const customEvent = e as CustomEvent<HotkeyConfig>;
      setConfig(customEvent.detail);
    };

    window.addEventListener(HOTKEY_CHANGED_EVENT, handleHotkeyChanged);
    return () => window.removeEventListener(HOTKEY_CHANGED_EVENT, handleHotkeyChanged);
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

  return null;
}
