"use client";

import { AdminSectionHeader } from "@/components/admin";

export default function MonitoringAlertsPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Alerts" description="Cảnh báo hệ thống & ngưỡng cấu hình." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Danh sách alert + severity + trạng thái xử lý.</div>
    </div>
  );
}
