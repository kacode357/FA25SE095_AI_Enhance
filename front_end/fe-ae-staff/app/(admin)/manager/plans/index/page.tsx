"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function PlansIndexPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Plans" description="Tạo & quản lý gói Pro / Group / Free limits." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="border rounded-md p-4">Free Tier</div>
        <div className="border rounded-md p-4">Pro Plan</div>
        <div className="border rounded-md p-4">Group Plan</div>
      </div>
    </div>
  );
}
