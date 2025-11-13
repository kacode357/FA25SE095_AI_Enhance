// app/student/notifications/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";

import { useGetNotifications } from "@/hooks/notifications/useGetNotifications";
import { useMarkAllNotificationsAsRead } from "@/hooks/notifications/useMarkAllNotificationsAsRead";
import { useMarkNotificationAsRead } from "@/hooks/notifications/useMarkNotificationAsRead";
import type { NotificationItem as NotificationDto } from "@/types/notifications/notifications.response";

type UiNotification = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string | null;
};

function safeParseMetadata(metadataJson: string | null): any | null {
  if (!metadataJson || typeof metadataJson !== "string") return null;
  try {
    return JSON.parse(metadataJson);
  } catch {
    return null;
  }
}

function mapDtoToUi(n: NotificationDto): UiNotification {
  const meta = safeParseMetadata(n.metadataJson);
  const actionUrl =
    meta && typeof meta.ActionUrl === "string" ? meta.ActionUrl : null;

  return {
    id: n.id,
    title: n.title || "Notification",
    content: n.content || "",
    createdAt: n.createdAt,
    isRead: n.isRead,
    actionUrl,
  };
}

function formatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const { getNotifications, loading: loadingList } = useGetNotifications();
  const { markAllNotificationsAsRead, loading: markingAll } =
    useMarkAllNotificationsAsRead();
  const { markNotificationAsRead } = useMarkNotificationAsRead();

  const [items, setItems] = useState<UiNotification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getNotifications({ take: 100 });
        if (res) {
          setItems(res.map(mapDtoToUi));
        }
      } finally {
        setInitialLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(
    () => items.filter((i) => !i.isRead).length,
    [items]
  );

  const handleMarkAll = async () => {
    if (!unreadCount) return;

    // update UI trước cho mượt
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));

    markAllNotificationsAsRead().catch((err) => {
      console.warn("[NotificationsPage] markAllAsRead error:", err);
    });
  };

  const handleClickItem = async (item: UiNotification) => {
    // Mark read nếu chưa
    if (!item.isRead) {
      setItems((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, isRead: true } : n
        )
      );

      markNotificationAsRead(item.id).catch((err) => {
        console.warn("[NotificationsPage] markNotificationAsRead error:", err);
      });
    }

    // Nếu có ActionUrl thì push
    if (item.actionUrl) {
      const path = item.actionUrl.startsWith("/")
        ? item.actionUrl
        : `/${item.actionUrl}`;
      router.push(`/student${path}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border bg-white hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <h1 className="text-lg sm:text-xl font-semibold">
                  Notifications
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Stay up to date with your course activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                {unreadCount} unread
              </span>
            )}
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={!unreadCount || markingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAll && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              <Check className="w-3 h-3" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>

        {/* Card list */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          {initialLoading || loadingList ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-start gap-3 border-b last:border-b-0 border-slate-100 py-3"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-slate-200 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/4 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              You&apos;re all caught up. No notifications yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleClickItem(item)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="pt-1">
                      {!item.isRead ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            New
                          </span>
                        )}
                      </div>
                      {item.content && (
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {item.content}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
