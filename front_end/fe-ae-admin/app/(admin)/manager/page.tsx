"use client";

import { AdminSectionHeader, DataTable, StatCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
    AlertTriangle,
    FileSpreadsheet,
    Gauge,
    Layers,
    Rocket,
    Settings,
    ShieldCheck,
    UploadCloud,
    Users
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

// Simple helper to format large numbers
function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function AdminDashboardPage() {
  const { fetchUsers, listData, loadingList, error } = useAdminUsers();

  // Fetch a small slice of recent users (page 1, 5 items) for the dashboard table
  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 5 });
  }, [fetchUsers]);

  const recentUsers = listData?.users ?? [];

  const userColumns = [
    {
      key: "email",
      header: "Email",
      className: "min-w-[160px]",
      render: (u: any) => <span className="text-slate-900 font-medium text-xs md:text-sm">{u.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (u: any) => (
        <Badge variant="outline" className="text-[10px] md:text-xs font-normal border-slate-200 bg-slate-50 text-slate-700">
          {u.status}
        </Badge>
      ),
    },
    {
      key: "role",
      header: "Role",
      className: "text-center",
      render: (u: any) => <span className="text-[10px] md:text-xs text-slate-600">{u.role}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      className: "text-center",
      render: (u: any) => <span className="text-[10px] md:text-xs text-slate-600">{u.subscriptionTier}</span>,
    },
  ];

  // Static / placeholder KPI data (would come from an analytics endpoint later)
  const stats = [
    {
      label: "Active Users",
      value: formatNumber(listData?.totalCount || 0),
      change: "+4.2%",
      icon: Users,
      accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Data Collected (24h)",
      value: "58.4K",
      change: "+12%",
      icon: UploadCloud,
      accent: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Crawl Success Rate",
      value: "98.3%",
      change: "+0.5%",
      icon: ShieldCheck,
      accent: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
      label: "Queued Jobs",
      value: "37",
      change: "-8%",
      icon: Layers,
      accent: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  const activities = [
    { id: 1, icon: Users, text: "New user registered (pending approval)", meta: "1m ago", tone: "text-emerald-600" },
    { id: 2, icon: FileSpreadsheet, text: "Scheduled export completed", meta: "12m ago", tone: "text-blue-600" },
    { id: 3, icon: ShieldCheck, text: "Policy check passed for 842 URLs", meta: "35m ago", tone: "text-violet-600" },
    { id: 4, icon: AlertTriangle, text: "3 crawl warnings (timeout)", meta: "1h ago", tone: "text-amber-600" },
  ];

  return (
    <div className="p-2 flex flex-col gap-6" aria-label="Admin dashboard overview">
      <AdminSectionHeader
        title="Dashboard"
        description="Tổng quan hệ thống: người dùng, thu thập dữ liệu, hàng đợi & sức khỏe."/>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={
              <span className="inline-flex items-center gap-2">
                {s.value}
              </span>
            }
            icon={<s.icon className="size-4" />}
            delta={s.change}
          />
        ))}
      </div>

      {/* Main content layout: recent users + activity + system status */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        {/* Recent Users & Quick Actions (span 2 cols on wide screens) */}
        <div className="flex flex-col gap-6 2xl:col-span-2">
          <div className="border rounded-lg bg-white flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">Recent Users</h3>
              <Link href="/manager/users" className="text-xs font-medium text-emerald-600 hover:underline">View all</Link>
            </div>
            <div className="flex-1 min-h-[180px]">
              <DataTable
                columns={userColumns}
                data={recentUsers}
                loading={loadingList}
                emptyMessage={error ? error : "No recent users."}
                rowKey={(r: any) => r.id}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border rounded-lg bg-white p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { href: "/manager/users", label: "Users", icon: Users },
                { href: "/manager/crawler", label: "Crawler", icon: Rocket },
                { href: "/manager/templates", label: "Templates", icon: FileSpreadsheet },
                { href: "/manager/monitoring/overview", label: "Monitoring", icon: Gauge },
                { href: "/manager/plans/quota", label: "Quota", icon: Settings },
                { href: "/manager/data/retention", label: "Retention", icon: Layers },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex items-center gap-2 rounded-md border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors p-2"
                >
                  <a.icon className="size-4 text-slate-500 group-hover:text-emerald-600" />
                  <span className="text-xs md:text-sm font-medium text-slate-700 group-hover:text-emerald-700">
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & System Status column */}
        <div className="flex flex-col gap-6">
          {/* Activity Timeline */}
          <div className="border rounded-lg bg-white p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">Latest Activity</h3>
              <span className="text-[10px] md:text-xs text-slate-400">streaming...</span>
            </div>
            <ul className="flex flex-col gap-3">
              {activities.map((act) => (
                <li key={act.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 border border-slate-200 bg-white ${act.tone}`}> 
                    <act.icon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-slate-700 leading-snug">{act.text}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">{act.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

            {/* System Status */}
          <div className="border rounded-lg bg-white p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base text-slate-900">System Status</h3>
              <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-[10px] md:text-xs">All Operational</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-600 flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-500"/> API Uptime</span>
                <span className="font-medium text-slate-800">99.98%</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-600 flex items-center gap-2"><UploadCloud className="size-4 text-blue-500"/> Crawl Throughput</span>
                <span className="font-medium text-slate-800">842 urls / h</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-600 flex items-center gap-2"><AlertTriangle className="size-4 text-amber-500"/> Warnings (24h)</span>
                <span className="font-medium text-slate-800">3</span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 mt-2">Metrics are refreshed ~5 min intervals (demo data).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
