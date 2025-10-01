"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function PaymentComplaintsPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Payment Complaints" description="Xử lý khiếu nại thanh toán." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Danh sách khiếu nại + trạng thái giải quyết.</div>
    </div>
  );
}
