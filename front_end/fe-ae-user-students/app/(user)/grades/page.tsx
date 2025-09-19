"use client";

import { useApp } from "@/components/providers/AppProvider";

export default function GradesPage() {
  const { assignments, submissions } = useApp();
  const graded = submissions.filter((s) => s.status === "graded");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Điểm & Feedback</h1>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Điểm</th>
                <th>Feedback</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {graded.map((s) => {
                const a = assignments.find((x) => x.id === s.assignmentId)!;
                return (
                  <tr key={s.id}>
                    <td>{a.title}</td>
                    <td>{s.grade ?? "-"}</td>
                    <td className="max-w-[480px]"><span className="truncate-2 block">{s.feedback ?? "-"}</span></td>
                    <td>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "-"}</td>
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
