"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  ExternalLink, 
  Search, 
  XCircle 
} from "lucide-react";

// Services & Hooks
import { useGetSubscriptionHistory } from "@/hooks/payments/useGetSubscriptionHistory";
import type { SubscriptionHistoryData } from "@/types/payments/payments.response";
import type { SubscriptionHistoryQuery } from "@/types/payments/payments.payload";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";

// --- HELPERS (Giữ nguyên) ---
const getStatusBadge = (status: number) => {
  switch (status) {
    case 0: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
    case 1: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Processing</span>;
    case 2: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Paid</span>;
    case 3: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Failed</span>;
    case 4: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Cancelled</span>;
    case 5: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">Expired</span>;
    default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>;
  }
};

const getTierName = (tier: number) => {
  switch (tier) {
    case 0: return "Free";
    case 1: return "Basic";
    case 2: return "Premium";
    case 3: return "Enterprise";
    default: return `Tier ${tier}`;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- MAIN COMPONENT ---

export default function PaymentHistoryPage() {
  const { getSubscriptionHistory, loading } = useGetSubscriptionHistory();
  const [data, setData] = useState<SubscriptionHistoryData | null>(null);

  // Filter State
  const [filters, setFilters] = useState<SubscriptionHistoryQuery>({
    Page: 1,
    PageSize: 10,
    Status: undefined,
    Tier: undefined,
    From: undefined,
    To: undefined,
  });

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const fetchData = useCallback(async () => {
    const query: SubscriptionHistoryQuery = { ...filters };
    if (dateFrom) query.From = dateFrom;
    if (dateTo) query.To = dateTo;
    if (query.Status === -1) delete query.Status;
    if (query.Tier === -1) delete query.Tier;

    const res = await getSubscriptionHistory(query);
    if (res?.data) {
      setData(res.data);
    }
  }, [filters, dateFrom, dateTo, getSubscriptionHistory]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.Page]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, Page: 1 }));
    fetchData(); 
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && data && newPage <= data.totalPages) {
      setFilters(prev => ({ ...prev, Page: newPage }));
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 md:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nav">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all your subscription transactions and invoices.
          </p>
        </div>
        
        <Link href="/student/subscription" className="btn btn-gradient text-sm shadow-lg shadow-brand/20">
          <CreditCard className="w-4 h-4" />
          Upgrade Plan
        </Link>
      </div>

      {/* Filter Section */}
      <div className="card p-4 md:p-5 bg-white">
        {/* items-end: Căn đáy các phần tử thẳng hàng */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Status</label>
            <Select 
              value={filters.Status?.toString() ?? "-1"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, Status: val === "-1" ? undefined : parseInt(val) }))}
            >
              {/* h-10, shadow-none */}
              <SelectTrigger className="w-full h-10 bg-white border-slate-200 shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">All Status</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="2">Paid</SelectItem>
                <SelectItem value="3">Failed</SelectItem>
                <SelectItem value="4">Cancelled</SelectItem>
                <SelectItem value="5">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tier Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">Plan Tier</label>
            <Select 
              value={filters.Tier?.toString() ?? "-1"} 
              onValueChange={(val) => setFilters(prev => ({ ...prev, Tier: val === "-1" ? undefined : parseInt(val) }))}
            >
              {/* h-10, shadow-none */}
              <SelectTrigger className="w-full h-10 bg-white border-slate-200 shadow-none">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">All Plans</SelectItem>
                <SelectItem value="1">Basic</SelectItem>
                <SelectItem value="2">Premium</SelectItem>
                <SelectItem value="3">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">From Date</label>
            <DateTimePicker 
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Start date"
              // h-10, shadow-none
              className="w-full h-10 shadow-none" 
            />
          </div>

          {/* To Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground ml-1">To Date</label>
            <DateTimePicker 
              value={dateTo}
              onChange={setDateTo}
              placeholder="End date"
              // h-10, shadow-none
              className="w-full h-10 shadow-none"
            />
          </div>

          {/* Search Button */}
          <button 
            type="submit" 
            disabled={loading}
            // h-10, shadow-none (ghi đè shadow của btn-blue-slow)
            className="btn btn-blue-slow w-full h-10 font-medium flex items-center justify-center gap-2 shadow-none"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            ) : (
              <>
                <Search className="w-4 h-4" /> Filter
              </>
            )}
          </button>
        </form>
      </div>

      {/* Table Section (Giữ nguyên) */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && !data ? (
                // Skeleton Loading
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((item) => (
                  <tr key={item.paymentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-nav">
                      #{item.orderCode}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand" />
                        {formatDateTimeVN(item.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {getTierName(item.tier)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-nav">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 0 && item.checkoutUrl ? (
                        <a 
                          href={item.checkoutUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-700 hover:underline"
                        >
                          Pay Now <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="w-8 h-8 text-slate-300" />
                      <p>No payment history found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Giữ nguyên) */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing page <span className="font-semibold">{data.page}</span> of <span className="font-semibold">{data.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page === 1}
                className="btn bg-white border border-border text-xs px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-nav"
              >
                <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              <button
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page === data.totalPages}
                className="btn bg-white border border-border text-xs px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-nav"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
