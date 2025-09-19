"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useApp();
  const sorted = notifications.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thông báo</h1>
      <div className="card p-4 space-y-3">
        {sorted.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-4 border-b last:border-0 py-3">
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-black/70">{n.body}</div>
              <div className="text-xs text-black/50 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            <div className="shrink-0">
              {!n.read ? (
                <button className="btn btn-outline h-9" onClick={() => markNotificationRead(n.id)}>Đánh dấu đã đọc</button>
              ) : (
                <span className="badge">Đã đọc</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
