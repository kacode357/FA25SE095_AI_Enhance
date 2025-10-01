"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function MonitoringQueuePage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Crawl Queue" description="Trạng thái & phân tích hàng đợi crawl." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Bảng queue + tốc độ xử lý.</div>
    </div>
  );
}
