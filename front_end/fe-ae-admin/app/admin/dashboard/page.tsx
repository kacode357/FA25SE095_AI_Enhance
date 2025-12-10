"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  TrendingUp,
  Users2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminDashboardOverview } from "@/hooks/admin-dashboard/useAdminDashboardOverview";

const formatCurrency = (value?: number, currency?: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatNumber = (value?: number) =>
  (value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatPercent = (value?: number) =>
  `${Number.isFinite(value) ? (value ?? 0).toFixed(1) : "0.0"}%`;

const toShortDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      })
    : "";

export default function AdminDashboardOverviewPage() {
  const { loading, overview, fetchAdminDashboardOverview } =
    useAdminDashboardOverview();

  useEffect(() => {
    fetchAdminDashboardOverview();
  }, [fetchAdminDashboardOverview]);

  const headlineCards = useMemo(
    () => [
      {
        title: "Revenue",
        value: formatCurrency(
          overview?.revenue.totalRevenue,
          overview?.revenue.currency
        ),
        note: `Avg order ${formatCurrency(
          overview?.revenue.averageOrderValue,
          overview?.revenue.currency
        )}`,
        icon: CreditCard,
      },
      {
        title: "Orders",
        value: formatNumber(overview?.payments.totalOrders),
        note: `Success rate ${formatPercent(overview?.payments.successRate)}`,
        icon: TrendingUp,
      },
      {
        title: "Active Subscriptions",
        value: formatNumber(overview?.subscriptions.totalActiveSubscriptions),
        note: `Churn ${formatPercent(overview?.subscriptions.churnRate)}`,
        icon: LayoutDashboard,
      },
      {
        title: "Users",
        value: formatNumber(overview?.users.totalUsers),
        note: `Conversion ${formatPercent(overview?.users.conversionRate)}`,
        icon: Users2,
      },
    ],
    [overview]
  );

  const revenueTimeline =
    overview?.revenue.timeline?.map((item) => ({
      name: toShortDate(item.date),
      revenue: item.revenue,
      orders: item.orders ?? 0,
    })) || [];

  const paymentsTimeline =
    overview?.payments.timeline?.map((item) => ({
      name: toShortDate(item.date),
      totalOrders: item.totalOrders,
      successRate: item.successRate ?? 0,
    })) || [];

  const subscriptionTimeline =
    overview?.subscriptions.timeline?.map((item) => ({
      name: toShortDate(item.date),
      newSubs: item.newSubscriptions,
      cancelled: item.cancelledSubscriptions,
      active: item.activeTotal,
    })) || [];

  const usersTimeline =
    overview?.users.timeline?.map((item) => ({
      name: toShortDate(item.date),
      newUsers: item.newUsers,
      totalUsers: item.totalUsers,
      paidUsers: item.paidUsers,
    })) || [];

  const revenueByTierData = Object.entries(
    overview?.revenue.revenueByTier || {}
  ).map(([tier, value]) => ({ tier, value }));

  const usersByRoleData = Object.entries(overview?.users.usersByRole || {}).map(
    ([role, value]) => ({ role, value })
  );

  const timelineLabel =
    overview?.period?.description ||
    `${overview?.period?.startDate || ""} to ${overview?.period?.endDate || ""}`;

  return (
    <motion.div
      className="space-y-6 p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">
            {timelineLabel || "Latest period"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <BarChart3 className="h-4 w-4 text-slate-700" />
            <span>{loading ? "Loading..." : "Live"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {headlineCards.map((card) => (
          <div
            key={card.title}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.note}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3 text-slate-700">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Revenue trend
              </h3>
              <p className="text-sm text-slate-500">
                Revenue and orders by period
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {revenueTimeline.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value, overview?.revenue.currency)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#7f71f4"
                    strokeWidth={2.4}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#f4a23b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Payments & success
              </h3>
              <p className="text-sm text-slate-500">
                Orders volume and success rate
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {paymentsTimeline.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, key) =>
                      key === "successRate"
                        ? formatPercent(value)
                        : formatNumber(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalOrders"
                    name="Total Orders"
                    stroke="#7f71f4"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
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
                Revenue by Tier
              </h3>
              <p className="text-sm text-slate-500">
                Distribution of total revenue
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-72">
            {revenueByTierData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByTierData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value, overview?.revenue.currency)
                    }
                  />
                  <Bar dataKey="value" name="Revenue" fill="#7f71f4" radius={6} />
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
                Current user base composition
              </p>
            </div>
            <Users2 className="h-5 w-5 text-slate-500" />
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
                  <Bar dataKey="value" name="Users" fill="#f4a23b" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Subscription timeline
            </h3>
            <p className="text-sm text-slate-500">
              New signups vs cancellations
            </p>
          </div>
          <LayoutDashboard className="h-5 w-5 text-slate-500" />
        </header>
        <div className="h-80">
          {subscriptionTimeline.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No timeline data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionTimeline} stackOffset="none">
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
                <Bar
                  dataKey="newSubs"
                  name="New"
                  fill="#7f71f4"
                  radius={[6, 6, 0, 0]}
                  stackId="subs"
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  stackId="subs"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Users timeline</h3>
            <p className="text-sm text-slate-500">
              New users and paid conversions
            </p>
          </div>
          <Users2 className="h-5 w-5 text-slate-500" />
        </header>
        <div className="h-72">
          {usersTimeline.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No timeline data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usersTimeline}>
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
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  );
}
