"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function MonitoringErrorsPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="System Errors" description="Danh sách & phân loại lỗi gần đây." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Bảng lỗi + filter theo service.</div>
    </div>
  );
}
