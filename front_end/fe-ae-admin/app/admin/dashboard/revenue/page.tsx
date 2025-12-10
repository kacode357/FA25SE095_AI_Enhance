"use client";

import type { ElementType } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CreditCard, LineChart, TrendingUp } from "lucide-react";
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

import { useAdminDashboardRevenue } from "@/hooks/admin-dashboard/useAdminDashboardRevenue";

const formatCurrency = (value?: number, currency?: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

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

export default function AdminDashboardRevenuePage() {
  const { loading, revenue, fetchAdminDashboardRevenue } =
    useAdminDashboardRevenue();

  useEffect(() => {
    fetchAdminDashboardRevenue();
  }, [fetchAdminDashboardRevenue]);

  const revenueTimeline =
    revenue?.timeline?.map((item) => ({
      name: toShortDate(item.date),
      revenue: item.revenue,
      orders: item.orders ?? 0,
    })) || [];

  const revenueByTierData = useMemo(
    () =>
      Object.entries(revenue?.revenueByTier || {}).map(([tier, value]) => ({
        tier,
        value,
      })),
    [revenue?.revenueByTier]
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
          <p className="text-sm text-slate-500">
            Total revenue, growth and tier breakdown
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {loading ? "Loading..." : "Updated"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue?.totalRevenue, revenue?.currency)}
          icon={CreditCard}
        />
        <StatCard
          title="Growth"
          value={formatPercent(revenue?.growth?.percentage)}
          description={revenue?.growth?.comparedTo || "previous period"}
          icon={TrendingUp}
        />
        <StatCard
          title="Avg Revenue / User"
          value={formatCurrency(
            revenue?.averageRevenuePerUser,
            revenue?.currency
          )}
          icon={LineChart}
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(
            revenue?.averageOrderValue,
            revenue?.currency
          )}
          icon={LineChart}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-500">
                Revenue and orders across the selected period
              </p>
            </div>
            <LineChart className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-80">
            {revenueTimeline.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={revenueTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(value: number, key) =>
                      key === "orders"
                        ? formatNumber(value)
                        : formatCurrency(value, revenue?.currency)
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
                </ReLineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Revenue by Tier
              </h3>
              <p className="text-sm text-slate-500">
                Contribution per subscription tier
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-80">
            {revenueByTierData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByTierData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value, revenue?.currency)
                    }
                  />
                  <Bar
                    dataKey="value"
                    name="Revenue"
                    fill="#7f71f4"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
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
  description?: string;
  icon: ElementType;
};

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className="rounded-full bg-slate-100 p-3 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
