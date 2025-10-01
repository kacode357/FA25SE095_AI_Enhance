"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function TemplatesPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="AI Report Templates" description="Quản lý mẫu báo cáo (PDF / Word / Markdown)." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="border rounded-md p-4">Template A</div>
        <div className="border rounded-md p-4">Template B</div>
        <div className="border rounded-md p-4">Template C</div>
      </div>
    </div>
  );
}
