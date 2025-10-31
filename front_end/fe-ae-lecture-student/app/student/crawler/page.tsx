// app/student/crawler/page.tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/** Khai báo key tab hợp lệ (mở rộng ở đây là đủ) */
type TabKey = "start" | "history";

/** Registry: tab -> dynamic import component */
const TAB_REGISTRY: Record<
  TabKey,
  {
    load: () => Promise<{ default: React.ComponentType<any> }>;
  }
> = {
  start: { load: () => import("./start-crawl/page") },
  history: { load: () => import("./history-crawl/page") },
};

/** Fallback khi tab không hợp lệ */
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
  const raw = (qs.get("tab") || "start").toLowerCase();

  // Ép kiểu an toàn
  const tab: TabKey | "unknown" = (Object.keys(TAB_REGISTRY) as TabKey[]).includes(
    raw as TabKey
  )
    ? (raw as TabKey)
    : "unknown";

  // Chọn component động theo tab
  const Active = useMemo(() => {
    if (tab === "unknown") return UnknownTab;

    // mỗi lần đổi tab mới tạo dynamic component tương ứng
    return dynamic(TAB_REGISTRY[tab].load, {
      loading: LoadingPanel,
      ssr: false,
    });
  }, [tab]);

  return <Active />;
}
