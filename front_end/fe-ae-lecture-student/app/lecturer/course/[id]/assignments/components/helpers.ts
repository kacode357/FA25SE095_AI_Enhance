import { AssignmentStatus } from "@/types/assignments/assignment.response";

export const statusClass: Record<AssignmentStatus, string> = {
    [AssignmentStatus.Draft]: "badge-assignment badge-assignment--draft",
    [AssignmentStatus.Scheduled]: "badge-assignment badge-assignment--scheduled",
    [AssignmentStatus.Active]: "badge-assignment badge-assignment--active",
    [AssignmentStatus.Extended]: "badge-assignment badge-assignment--extended",
    [AssignmentStatus.Overdue]: "badge-assignment badge-assignment--overdue",
    [AssignmentStatus.Closed]: "badge-assignment badge-assignment--closed",
    [AssignmentStatus.Graded]: "badge-assignment badge-assignment--graded",
};

export const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");

export const daysUntilDue = (iso?: string | null) => {
    if (!iso) return "—";
    try {
        const ms = new Date(iso).getTime() - Date.now();
        const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
        if (days > 1) return `${days} days`;
        if (days === 1) return `1 day`;
        if (days === 0) return `0`;
        return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""}`;
    } catch (e) {
        return "—";
    }
};

export default {};
