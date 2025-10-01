"use client";
import { AdminSectionHeader } from "@/components/admin";
export default function RolesPage(){
  return (
    <div className="p-4 space-y-6">
      <AdminSectionHeader title="Role Management" description="Quản lý vai trò & phân quyền người dùng." />
      <div className="text-sm text-slate-600">(Placeholder) Danh sách roles, gán quyền cho user, tạo role mới...</div>
    </div>
  );
}
