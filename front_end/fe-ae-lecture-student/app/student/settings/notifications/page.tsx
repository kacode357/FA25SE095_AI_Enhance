"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const NOTI_SOUND_KEY = "student:noti:soundEnabled";
const NOTI_SOUND_EVENT = "student:noti:sound-changed";

export default function StudentNotificationSettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(NOTI_SOUND_KEY);
    if (raw === "off") {
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
    }
    setHydrated(true);
  }, []);

  const handleToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(NOTI_SOUND_KEY, next ? "on" : "off");
      // bắn event cho NotificationsMenu biết để update ngay
      window.dispatchEvent(
        new CustomEvent(NOTI_SOUND_EVENT, { detail: { enabled: next } })
      );
    }
  };

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-6 sm:py-5 text-sm text-muted-foreground">
        Loading notification settings...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <Bell className="h-4 w-4 text-brand" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-nav">Notification sound</h1>
          <p className="text-xs text-muted-foreground">
            Choose whether to play a sound when new notifications arrive.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-nav">
            Play sound for new notifications
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            When enabled, a short sound will play whenever a new notification is
            received.
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border transition-colors
            ${
              soundEnabled
                ? "bg-brand border-brand/70"
                : "bg-slate-200 border-slate-300"
            }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              soundEnabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
          <span className="sr-only">Toggle notification sound</span>
        </button>
      </div>
    </div>
  );
}
