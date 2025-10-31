"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { TAB_REGISTRY, normalizeTab, type TabKey } from "./_tabs";

/** Fallback khi tab không hợp lệ (gần như không xảy ra vì đã normalize) */
function UnknownTab() {
  return (
    <div className="card rounded-2xl p-6 text-sm text-[var(--text-muted)]">
      Unknown tab. Please select from the sidebar.
    </div>
  );
}

/** Loader nhỏ cho dynamic component */
function LoadingPanel() {
  return (
    <div className="py-10 flex items-center gap-2 justify-center text-[var(--text-muted)]">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading…
    </div>
  );
}

export default function CrawlerHubPage() {
  const qs = useSearchParams();
  const tab: TabKey = normalizeTab(qs.get("tab"));

  const Active = useMemo(() => {
    const meta = TAB_REGISTRY[tab];
    return meta
      ? dynamic(meta.load, { loading: LoadingPanel, ssr: false })
      : UnknownTab;
  }, [tab]);

  return <Active />;
}
