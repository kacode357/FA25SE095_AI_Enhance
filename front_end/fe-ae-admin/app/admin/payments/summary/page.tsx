"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  XCircle, 
  AlertCircle,
  Users,
  ArrowUpRight
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Components
import SummaryFilters, { SummaryFiltersState } from "./components/SummaryFilters";

// Hooks & Types
import { useAdminSubscriptionPaymentsSummary } from "@/hooks/payments/useAdminPaymentsSummary";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { AdminUserRoleFilter } from "@/types/admin/admin-user.payload";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

export default function SubscriptionSummaryPage() {
  // --- HOOKS ---
  const { 
    loading: summaryLoading, 
    summary, 
    fetchAdminSubscriptionPaymentsSummary 
  } = useAdminSubscriptionPaymentsSummary();

  const { 
    loading: usersLoading, 
    items: recentStudents, 
    fetchAdminUsers 
  } = useAdminUsers();

  const [filters, setFilters] = useState<SummaryFiltersState>({});

  // --- EFFECT: FETCH DATA ---
  useEffect(() => {
    // 1. Gọi API Summary (có filter user)
    fetchAdminSubscriptionPaymentsSummary({
      userId: filters.searchTerm, // Map searchTerm vào userId
      from: filters.from,
      to: filters.to
    });

    // 2. Gọi API Recent Students (Luôn lấy 5 em mới nhất)
    fetchAdminUsers({
      page: 1,
      pageSize: 5,
      role: AdminUserRoleFilter.Student,
      sortBy: "CreatedAt",
      sortOrder: "Desc"
    });
  }, [fetchAdminSubscriptionPaymentsSummary, fetchAdminUsers, filters]);

  // Helper format VND
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* --- HEADER --- */}
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Summary</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time financial overview and student registration activities.
        </p>
      </div>

      <div className="px-5 space-y-6">
        
        {/* --- 1. FILTERS --- */}
        <SummaryFilters 
          loading={summaryLoading} 
          filters={filters} 
          onChange={setFilters} 
        />

        {/* --- 2. KEY METRICS (Overview Cards) --- */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Revenue Card */}
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                {summaryLoading ? (
                  <Skeleton className="h-9 w-40" />
                ) : (
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatMoney(summary?.totalRevenue || 0)}
                  </h3>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            {/* Decoration BG */}
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-emerald-50/50 z-0" />
          </div>

          {/* Transactions Card */}
          <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between z-10 relative">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
                {summaryLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {summary?.totalPayments || 0}
                  </h3>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
             {/* Decoration BG */}
             <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-blue-50/50 z-0" />
          </div>
        </div>

        {/* --- 3. MAIN CONTENT GRID (2/3 + 1/3) --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* LEFT: PAYMENT STATUS BREAKDOWN (Chiếm 2 cột) */}
          <div className="lg:col-span-2 flex flex-col rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand" />
                Payment Status Breakdown
              </h3>
            </div>
            
            <div className="p-6">
              {summaryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatusCard label="Paid" count={summary?.statusBreakdown?.Paid || 0} icon={CheckCircle2} color="emerald" />
                  <StatusCard label="Pending" count={summary?.statusBreakdown?.Pending || 0} icon={Clock} color="amber" />
                  <StatusCard label="Processing" count={summary?.statusBreakdown?.Processing || 0} icon={Clock} color="blue" />
                  <StatusCard label="Failed" count={summary?.statusBreakdown?.Failed || 0} icon={AlertCircle} color="red" />
                  <StatusCard label="Cancelled" count={summary?.statusBreakdown?.Cancelled || 0} icon={XCircle} color="slate" />
                  <StatusCard label="Expired" count={summary?.statusBreakdown?.Expired || 0} icon={XCircle} color="gray" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RECENT STUDENTS (Chiếm 1 cột) */}
          <div className="flex flex-col rounded-xl border border-[var(--border)] bg-white shadow-sm h-full">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" />
                Newest Students
              </h3>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">Last 5</Badge>
            </div>

            <div className="flex-1 p-0">
              {usersLoading ? (
                 <div className="p-6 space-y-5">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-3">
                       <Skeleton className="h-9 w-9 rounded-full" />
                       <div className="space-y-1.5 flex-1">
                         <Skeleton className="h-3 w-3/4" />
                         <Skeleton className="h-2 w-1/2" />
                       </div>
                     </div>
                   ))}
                 </div>
              ) : recentStudents.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <p>No new students found.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentStudents.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={user.profilePictureUrl || ""} />
                        <AvatarFallback className="bg-brand/10 text-brand text-xs font-medium">
                          {(user.email[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {(user.firstName || user.lastName) 
                            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() 
                            : "Unnamed Student"}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono">
                          {user.email}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                           {formatDateTimeVN(user.createdAt).split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-[var(--border)] rounded-b-xl text-center">
               <a href="/admin/students" className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1">
                 View All Students <ArrowUpRight className="h-3 w-3" />
               </a>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// --- Sub Component: Status Card (Làm đẹp hơn) ---
function StatusCard({ label, count, icon: Icon, color }: { label: string, count: number, icon: any, color: string }) {
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50/50 text-emerald-700 border-emerald-100 hover:border-emerald-200",
    amber: "bg-amber-50/50 text-amber-700 border-amber-100 hover:border-amber-200",
    blue: "bg-blue-50/50 text-blue-700 border-blue-100 hover:border-blue-200",
    red: "bg-red-50/50 text-red-700 border-red-100 hover:border-red-200",
    slate: "bg-slate-50/50 text-slate-700 border-slate-200 hover:border-slate-300",
    gray: "bg-gray-50/50 text-gray-600 border-gray-200 hover:border-gray-300",
  };

  const css = styles[color] || styles.slate;

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-200 ${css}`}>
      <div className="mb-2 p-2 bg-white rounded-full shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-2xl font-bold tracking-tight">{count}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 mt-1">{label}</span>
    </div>
  );
}