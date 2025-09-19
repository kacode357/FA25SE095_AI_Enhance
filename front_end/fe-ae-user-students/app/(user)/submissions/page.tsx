"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function SubmissionsPage() {
  const { submissions, assignments } = useApp();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trạng thái nộp bài</h1>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
                <th>Cập nhật</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const a = assignments.find((x) => x.id === s.assignmentId)!;
                return (
                  <tr key={s.id}>
                    <td>{a.title}</td>
                    <td>{s.isGroup ? "Nhóm" : "Cá nhân"}</td>
                    <td><span className="badge">{s.status}</span></td>
                    <td>{s.grade ?? "-"}</td>
                    <td>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "-"}</td>
                    <td>{s.contentUrl ? <a className="text-blue-600" href={s.contentUrl} target="_blank">Xem</a> : "-"}</td>
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
