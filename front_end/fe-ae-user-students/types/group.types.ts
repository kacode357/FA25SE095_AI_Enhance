export interface GroupItem {
    id: string;
    name: string;
    members: number;
    max: number;
    leader?: string;
    status: "active" | "locked";
    createdAt: string;
    updatedAt: string;
}