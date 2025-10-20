import { FolderTree } from "lucide-react";
import React from "react";

interface Props { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
      <div className="mb-4 text-emerald-600">
        {icon || <FolderTree className="size-10" />}
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-slate-500 text-sm mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
