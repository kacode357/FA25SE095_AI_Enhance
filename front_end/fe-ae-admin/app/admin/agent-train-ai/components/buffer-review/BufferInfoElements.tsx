"use client";

import React from "react";

export const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex gap-2">
    <dt className="w-24 font-medium text-slate-500">{label}:</dt>
    <dd className="flex-1 text-slate-700">{value}</dd>
  </div>
);

export const MetricCard: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
    <p className="text-[11px] font-semibold uppercase text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);
