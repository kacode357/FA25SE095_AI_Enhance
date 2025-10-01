"use client";

import { AdminSectionHeader } from "@/components/admin";

export default function DataRetentionPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Data Retention" description="Thiết lập thời gian lưu trữ & chính sách tự động xóa." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Form cấu hình retention policies.</div>
    </div>
  );
}
