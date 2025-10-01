"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function QuotaManagementPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Quota Allocation" description="Cộng/trừ quota cho lớp hoặc khoa." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Bảng phân bổ quota.</div>
    </div>
  );
}
