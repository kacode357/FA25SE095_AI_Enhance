"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function DeadlinesPage() {
  const { reminders, toggleReminder, assignments } = useApp();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quản lý hạn nộp</h1>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Hạn</th>
                <th>Liên quan</th>
                <th>Nhắc</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => {
                const a = r.assignmentId ? assignments.find((x) => x.id === r.assignmentId) : undefined;
                return (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{new Date(r.dueAt).toLocaleString()}</td>
                    <td>{a ? a.title : "-"}</td>
                    <td>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={r.enabled} onChange={(e) => toggleReminder(r.id, e.target.checked)} />
                        <span>{r.enabled ? "Bật" : "Tắt"}</span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
