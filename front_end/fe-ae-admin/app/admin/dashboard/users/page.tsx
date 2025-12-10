"use client";

import type { ElementType } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Users as UsersIcon, UserRound } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminDashboardUsers } from "@/hooks/admin-dashboard/useAdminDashboardUsers";

const formatNumber = (value?: number) =>
  (value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatPercent = (value?: number) =>
  `${Number.isFinite(value) ? (value ?? 0).toFixed(2) : "0.00"}%`;

const toShortDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      })
    : "";

export default function AdminDashboardUsersPage() {
  const { loading, users, fetchAdminDashboardUsers } = useAdminDashboardUsers();

  useEffect(() => {
    fetchAdminDashboardUsers();
  }, [fetchAdminDashboardUsers]);

  const usersByTierData = useMemo(
    () =>
      Object.entries(users?.usersByTier || {}).map(([tier, total]) => ({
        tier,
        total,
      })),
    [users?.usersByTier]
  );

  const usersByRoleData = useMemo(
    () =>
      Object.entries(users?.usersByRole || {}).map(([role, total]) => ({
        role,
        total,
      })),
    [users?.usersByRole]
  );

  const timelineData =
    users?.timeline?.map((item) => ({
      name: toShortDate(item.date),
      totalUsers: item.totalUsers,
      newUsers: item.newUsers,
      paidUsers: item.paidUsers,
    })) || [];

  return (
    <motion.div
      className="space-y-6 p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">
            User totals, conversion and quota monitoring
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {loading ? "Loading..." : "Updated"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={formatNumber(users?.totalUsers)} icon={UsersIcon} />
        <StatCard title="New Users" value={formatNumber(users?.newUsers)} icon={UserRound} />
        <StatCard title="Active Users" value={formatNumber(users?.activeUsers)} icon={Activity} />
        <StatCard title="Conversion Rate" value={formatPercent(users?.conversionRate)} icon={Activity} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Users by Tier
              </h3>
              <p className="text-sm text-slate-500">
                Current subscription tiers
              </p>
            </div>
            <UsersIcon className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {usersByTierData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersByTierData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Bar
                    dataKey="total"
                    name="Users"
                    fill="#7f71f4"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Users by Role
              </h3>
              <p className="text-sm text-slate-500">
                Breakdown across roles
              </p>
            </div>
            <UserRound className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {usersByRoleData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersByRoleData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Bar
                    dataKey="total"
                    name="Users"
                    fill="#f4a23b"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Users Near Quota
              </h3>
              <p className="text-sm text-slate-500">
                Monitor accounts approaching limits
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </header>
          <div className="space-y-2">
            {(users?.usersNearQuota || []).slice(0, 8).map((user, idx) => (
              <div
                key={`${user.userId || idx}`}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {user.email || user.userId}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatPercent(user.usagePercentage)}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {user.quotaUsed}/{user.quotaLimit} used
                </p>
              </div>
            ))}
            {(users?.usersNearQuota || []).length === 0 && (
              <p className="text-sm text-slate-500">No users near quota.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
              <p className="text-sm text-slate-500">
                New users and paid conversions
              </p>
            </div>
            <Activity className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {timelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No timeline data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    name="Total"
                    stroke="#7f71f4"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    name="New"
                    stroke="#f4a23b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="paidUsers"
                    name="Paid"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </ReLineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: ElementType;
};

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="rounded-full bg-slate-100 p-3 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
