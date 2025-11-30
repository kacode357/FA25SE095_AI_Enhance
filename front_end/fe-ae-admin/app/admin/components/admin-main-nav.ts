// admin-main-nav.ts
import { FileText, Users2, Megaphone, CreditCard } from "lucide-react";

export const mainNav = [
  {
    href: "/admin/users",
    label: "Users",
    icon: Users2,
    description: "Manage All Users",
  },
  {
    href: "/admin/pending-approval",
    label: "Pending Approval",
    icon: FileText,
    description: "Manage Pending Approvals",
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: Megaphone,
    description: "Manage Announcements",
    children: [
      {
        href: "/admin/announcements",
        label: "All Announcements",
      },
      {
        href: "/admin/announcements/create",
        label: "Create Announcement",
      },
    ],
  },
  {
    href: "/admin/subscription-payments",
    label: "Subscription Payments",
    icon: CreditCard,
    description: "Manage subscription payments",
    children: [
      {
        href: "/admin/subscription-payments",
        label: "Payments List",
      },
      {
        href: "/admin/subscription-payments/summary",
        label: "Summary & Analytics",
      },
    ],
  },
];
