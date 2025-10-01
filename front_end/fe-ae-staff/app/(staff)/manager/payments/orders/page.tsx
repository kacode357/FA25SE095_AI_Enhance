"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function PaymentOrdersPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Payment Orders" description="Xem và xử lý các đơn thanh toán." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Bảng đơn hàng + bộ lọc trạng thái.</div>
    </div>
  );
}
