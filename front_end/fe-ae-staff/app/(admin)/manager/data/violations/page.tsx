"use client";

import { AdminSectionHeader } from "@/components/admin";

export default function DataViolationsPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Data Violations" description="Rà soát & xóa dữ liệu vi phạm." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Bảng danh sách dữ liệu bị flag.</div>
    </div>
  );
}
