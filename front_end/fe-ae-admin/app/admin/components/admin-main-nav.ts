// admin-main-nav.ts
import { FileText, Users2 } from "lucide-react";

export const mainNav = [
  {
    href: "/admin/users",
    label: "Users",
    icon: Users2,
    description: "Manage All Users",
    count: 12,
  },
  {
    href: "/admin/pending-approval",
    label: "Pending Approval",
    icon: FileText,
    description: "Manage Pending Approvals",
    count: 8,
  },
];
