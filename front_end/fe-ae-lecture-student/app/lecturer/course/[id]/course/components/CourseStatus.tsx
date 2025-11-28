"use client";

export function getStatusLabel(status: any): string {
    switch (status) {
        case ("PendingApproval" as any):
        case (1 as any):
            return "Pending Approval";
        case ("Active" as any):
        case (2 as any):
            return "Active";
        case ("Inactive" as any):
        case (3 as any):
            return "Inactive";
        case ("Rejected" as any):
        case (4 as any):
            return "Rejected";
        default:
            return "Unknown";
    }
}

export function getStatusColor(status: any): string {
    switch (status) {
        case ("PendingApproval" as any):
        case (1 as any):
            return "bg-yellow-100 text-yellow-800 border border-yellow-300";
        case ("Active" as any):
        case (2 as any):
            return "bg-emerald-100 text-emerald-800 border border-emerald-300";
        case ("Inactive" as any):
        case (3 as any):
            return "bg-slate-100 text-slate-700 border border-slate-300";
        case ("Rejected" as any):
        case (4 as any):
            return "bg-red-100 text-red-700 border border-red-300";
        default:
            return "bg-slate-100 text-slate-700 border border-slate-300";
    }
}

export function StatusChip({ status }: { status: any }) {
    return (
        <span className={`px-2.5 py-1 text-xs rounded-full leading-none ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
        </span>
    );
}
