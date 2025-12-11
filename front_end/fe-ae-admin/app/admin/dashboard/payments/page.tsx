"use client";

import type { ElementType } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock3, CreditCard, PieChart } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart as RePieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAdminDashboardPayments } from "@/hooks/admin-dashboard/useAdminDashboardPayments";

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

export default function AdminDashboardPaymentsPage() {
  const { loading, payments, fetchAdminDashboardPayments } =
    useAdminDashboardPayments();

  useEffect(() => {
    fetchAdminDashboardPayments();
  }, [fetchAdminDashboardPayments]);

  const timelineData =
    payments?.timeline?.map((item) => {
      const totalOrders = item.totalOrders ?? item.totalCount ?? 0;
      const successfulOrders =
        item.successfulOrders ??
        item.successCount ??
        (item.successRate !== undefined
          ? Math.round((item.successRate / 100) * totalOrders)
          : 0);
      const successRate =
        item.successRate ??
        (totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0);

      return {
        name: toShortDate(item.date),
        totalOrders,
        successfulOrders,
        successRate,
      };
    }) || [];

  const statusData = useMemo(
    () =>
      Object.entries(payments?.statusDistribution || {}).map(
        ([status, total]) => ({
          status,
          total,
        })
      ),
    [payments?.statusDistribution]
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
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">
            Orders, success rate, status distribution
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {loading ? "Loading..." : "Updated"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={formatNumber(payments?.totalOrders)} icon={CreditCard} />
        <StatCard title="New Orders" value={formatNumber(payments?.newOrders)} icon={CreditCard} />
        <StatCard title="Success Rate" value={formatPercent(payments?.successRate)} icon={PieChart} />
        <StatCard
          title="Avg Processing Time"
          value={`${payments?.averageProcessingTime ?? 0} ms`}
          icon={Clock3}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Orders & Success Trend
              </h3>
              <p className="text-sm text-slate-500">
                Total orders with success rate over time
              </p>
            </div>
            <PieChart className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-80">
            {timelineData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={timelineData}>
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
                    name="Orders"
                    stroke="#7f71f4"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Success Rate"
                    stroke="#10b981"
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
                Status Distribution
              </h3>
              <p className="text-sm text-slate-500">
                Breakdown of payment outcomes
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </header>
          <div className="h-80">
            {statusData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={statusData}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, percent = 0 }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={["#7f71f4", "#22c55e", "#f97316", "#ef4444", "#0ea5e9"][index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Failed Payments
            </h3>
            <p className="text-sm text-slate-500">
              Recent failed or cancelled payments
            </p>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </header>
        <div className="space-y-2">
          {(payments?.failedPayments || []).slice(0, 6).map((item, idx) => (
            <div
              key={`${item.paymentId || idx}`}
              className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {item.orderCode || "Order"}
                </span>
                <span className="text-xs text-slate-500">
                  {item.occurredAt
                    ? new Date(item.occurredAt).toLocaleString()
                    : ""}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {item.failureReason || "No reason provided"}
              </p>
              <p className="text-xs text-slate-500">
                {item.userEmail || item.userId || ""}
              </p>
            </div>
          ))}
          {(payments?.failedPayments || []).length === 0 && (
            <p className="text-sm text-slate-500">No failed payments.</p>
          )}
        </div>
      </section>
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
