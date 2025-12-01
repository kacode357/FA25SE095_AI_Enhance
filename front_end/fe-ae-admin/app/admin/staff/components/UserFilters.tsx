"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AdminUsersQuery } from "@/types/admin/admin-user.payload";

type FiltersState = {
  searchTerm?: string;
  sortBy?: AdminUsersQuery["sortBy"];
  sortOrder?: AdminUsersQuery["sortOrder"];
};

type Props = {
  loading?: boolean;
  filters: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
};

export default function UserFilters({ loading, filters, onChange }: Props) {
  const handleReset = () => {
    onChange({
      searchTerm: "",
      sortBy: "CreatedAt",
      sortOrder: "Desc",
    });
  };

  return (
    // Flex row để xếp hàng ngang, Search co giãn, Sort cố định
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-slate-50/70 p-3 sm:flex-row sm:items-center">
      
      {/* 1. Search Bar - Chiếm phần lớn diện tích (flex-1) */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search students by email, name..."
          className="pl-8 text-sm h-9"
          value={filters.searchTerm ?? ""}
          disabled={loading}
          onChange={(e) => onChange({ searchTerm: e.target.value })}
        />
      </div>

      {/* 2. Sort Select - Nằm gọn bên phải */}
      <div className="w-full sm:w-[200px]">
        <Select
          disabled={loading}
          value={
            filters.sortBy === "CreatedAt" && filters.sortOrder === "Desc"
              ? "created_desc"
              : filters.sortBy === "CreatedAt" && filters.sortOrder === "Asc"
              ? "created_asc"
              : filters.sortBy === "LastLoginAt" && filters.sortOrder === "Desc"
              ? "lastlogin_desc"
              : filters.sortBy === "LastLoginAt" && filters.sortOrder === "Asc"
              ? "lastlogin_asc"
              : "created_desc"
          }
          onValueChange={(v) => {
            if (v === "created_asc") {
              onChange({ sortBy: "CreatedAt", sortOrder: "Asc" });
            } else if (v === "created_desc") {
              onChange({ sortBy: "CreatedAt", sortOrder: "Desc" });
            } else if (v === "lastlogin_asc") {
              onChange({ sortBy: "LastLoginAt", sortOrder: "Asc" });
            } else if (v === "lastlogin_desc") {
              onChange({ sortBy: "LastLoginAt", sortOrder: "Desc" });
            }
          }}
        >
          <SelectTrigger className="h-9 text-xs border border-[var(--border)] sm:text-sm bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Newest created</SelectItem>
            <SelectItem value="created_asc">Oldest created</SelectItem>
            <SelectItem value="lastlogin_desc">
              Last login (recent first)
            </SelectItem>
            <SelectItem value="lastlogin_asc">
              Last login (oldest first)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Nút Clear (Hiện khi có search) */}
      {(filters.searchTerm) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-slate-500 hover:text-slate-900"
          onClick={handleReset}
          disabled={loading}
        >
          Clear
        </Button>
      )}
    </div>
  );
}