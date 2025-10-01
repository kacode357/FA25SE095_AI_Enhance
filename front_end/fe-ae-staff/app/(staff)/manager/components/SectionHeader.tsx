import React from "react";

interface Props { title: string; description?: string; actions?: React.ReactNode; }

export default function SectionHeader({ title, description, actions }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">{title}</h1>
        {description && <p className="text-slate-500 text-sm mt-1 max-w-prose">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
