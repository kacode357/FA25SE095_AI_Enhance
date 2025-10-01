"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function PaymentSettingsPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Payment Settings" description="Cấu hình thanh toán & QR code." />
      <div className="border rounded-md p-4 text-sm text-slate-600">(Placeholder) Form cấu hình phương thức thanh toán.</div>
    </div>
  );
}
