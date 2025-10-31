"use client";
import type { ComponentType } from "react";
import { Rocket, Clock, Target } from "lucide-react";

type IconLike = ComponentType<{ className?: string }>;

export const TAB_REGISTRY = {
  start: {
    label: "Start",
    icon: Rocket as IconLike,
    load: () => import("./start-crawl/page"),
  },
  history: {
    label: "History",
    icon: Clock as IconLike,
    load: () => import("./history-crawl/page"),
  },
 
} as const;

export type TabKey = keyof typeof TAB_REGISTRY;
export const DEFAULT_TAB: TabKey = "start";

export const isTab = (v: string): v is TabKey => v in TAB_REGISTRY;

export function normalizeTab(raw?: string | null): TabKey {
  if (!raw) return DEFAULT_TAB;
  const k = raw.toLowerCase();
  return isTab(k) ? (k as TabKey) : DEFAULT_TAB;
}
