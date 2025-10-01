"use client";

import { AdminSectionHeader } from "@/components/admin";

export default function CrawlerConfigPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Crawler Configuration" description="Cấu hình nguồn crawl, tốc độ, lọc trùng / spam." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="border rounded-md p-4">Nguồn cho phép</div>
        <div className="border rounded-md p-4">Giới hạn tốc độ</div>
        <div className="border rounded-md p-4">Bộ lọc duplicate / spam</div>
      </div>
    </div>
  );
}
