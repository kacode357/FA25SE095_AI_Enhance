"use client";

import { useApp } from "@/components/providers/AppProvider";
import Link from "next/link";

export default function AssignmentsPage() {
  const { assignments, submissions } = useApp();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bài tập</h1>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Hạn</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const sub = submissions.find((s) => s.assignmentId === a.id);
                return (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.type}</td>
                    <td>{new Date(a.dueAt).toLocaleString()}</td>
                    <td><span className="badge">{sub ? sub.status : "not_submitted"}</span></td>
                    <td>
                      <Link className="text-blue-600" href={`/assignments/${a.id}`}>Chi tiết</Link>
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
