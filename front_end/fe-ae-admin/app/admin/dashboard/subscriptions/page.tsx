"use client";

import type { ElementType } from "react";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Layers, RefreshCcw, TrendingDown, Users } from "lucide-react";
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

import { useAdminDashboardSubscriptions } from "@/hooks/admin-dashboard/useAdminDashboardSubscriptions";

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

export default function AdminDashboardSubscriptionsPage() {
  const { loading, subscriptions, fetchAdminDashboardSubscriptions } =
    useAdminDashboardSubscriptions();

  useEffect(() => {
    fetchAdminDashboardSubscriptions();
  }, [fetchAdminDashboardSubscriptions]);

  const subsByTierData = useMemo(
    () =>
      Object.entries(subscriptions?.subscriptionsByTier || {}).map(
        ([tier, total]) => ({ tier, total })
      ),
    [subscriptions?.subscriptionsByTier]
  );

  const timelineData =
    subscriptions?.timeline?.map((item) => ({
      name: toShortDate(item.date),
      newSubs: item.newSubscriptions,
      cancelled: item.cancelledSubscriptions,
      active: item.activeTotal,
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
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500">
            Active subscriptions, churn, renewals and tier breakdown
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {loading ? "Loading..." : "Updated"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active"
          value={formatNumber(subscriptions?.totalActiveSubscriptions)}
          icon={Users}
        />
        <StatCard
          title="New"
          value={formatNumber(subscriptions?.newSubscriptions)}
          icon={Layers}
        />
        <StatCard
          title="Churn Rate"
          value={formatPercent(subscriptions?.churnRate)}
          icon={TrendingDown}
        />
        <StatCard
          title="Renewal Rate"
          value={formatPercent(subscriptions?.renewalRate)}
          icon={RefreshCcw}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Subscriptions by Tier
              </h3>
              <p className="text-sm text-slate-500">
                Active subscriptions grouped by tier
              </p>
            </div>
            <Layers className="h-5 w-5 text-slate-500" />
          </header>
          <div className="h-80">
            {subsByTierData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subsByTierData} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                  <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => formatNumber(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                  <Bar
                    dataKey="total"
                    name="Active"
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
                Upgrades & Downgrades
              </h3>
              <p className="text-sm text-slate-500">
                Movement across tiers for the period
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-500" />
          </header>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span>Upgrades</span>
              <span className="font-semibold">
                {formatNumber(subscriptions?.upgradeDowngrade?.upgrades)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span>Downgrades</span>
              <span className="font-semibold">
                {formatNumber(subscriptions?.upgradeDowngrade?.downgrades)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <span>Net Change</span>
              <span className="font-semibold">
                {formatNumber(subscriptions?.upgradeDowngrade?.netChange)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
            <p className="text-sm text-slate-500">
              New subscriptions and cancellations
            </p>
          </div>
          <Users className="h-5 w-5 text-slate-500" />
        </header>
        <div className="h-80">
          {timelineData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No timeline data.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9f2" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Legend />
                <Bar
                  dataKey="newSubs"
                  name="New"
                  fill="#7f71f4"
                  radius={[8, 8, 0, 0]}
                  stackId="subs"
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelled"
                  fill="#f97316"
                  radius={[8, 8, 0, 0]}
                  stackId="subs"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
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
