"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function MonitoringOverviewPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="System Monitoring" description="Tổng quan queue crawl, lỗi & cảnh báo." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="border rounded-md p-4">Queue Size</div>
        <div className="border rounded-md p-4">Errors 24h</div>
        <div className="border rounded-md p-4">Alert Active</div>
        <div className="border rounded-md p-4">Throughput</div>
      </div>
    </div>
  );
}
