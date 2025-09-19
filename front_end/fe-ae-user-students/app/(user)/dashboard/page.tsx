"use client";

import { useApp } from "@/components/providers/AppProvider";
import Link from "next/link";

export default function DashboardPage() {
  const { classes, assignments, submissions, notifications } = useApp();
  const upcoming = assignments
    .slice()
    .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt))
    .slice(0, 3);
  const unread = notifications.filter((n) => !n.read).slice(0, 3);
  const recent = submissions.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <section className="card p-4">
          <h2 className="font-semibold mb-2">Lớp tham gia ({classes.length})</h2>
          <ul className="text-sm text-black/70 space-y-1">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <span>{c.name}</span>
                <Link className="text-blue-600" href="/assignments">Xem</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-4">
          <h2 className="font-semibold mb-2">Sắp đến hạn</h2>
          <ul className="text-sm text-black/70 space-y-1">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span className="truncate-2">{a.title}</span>
                <Link className="text-blue-600" href={`/assignments/${a.id}`}>Chi tiết</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-4">
          <h2 className="font-semibold mb-2">Thông báo mới</h2>
          <ul className="text-sm text-black/70 space-y-1">
            {unread.map((n) => (
              <li key={n.id} className="truncate-2">{n.title} - {new Date(n.createdAt).toLocaleString()}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="card p-4">
        <h2 className="font-semibold mb-2">Nộp bài gần đây</h2>
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => {
                const a = assignments.find((x) => x.id === s.assignmentId)!;
                return (
                  <tr key={s.id}>
                    <td>{a.title}</td>
                    <td>
                      <span className="badge">{s.status}</span>
                    </td>
                    <td>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
