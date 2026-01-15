import { Users2, Megaphone, CreditCard, LayoutDashboard } from "lucide-react";

export const mainNav = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & system stats",
    children: [
      {
        href: "/admin/dashboard",
        label: "Overview",
      },
      {
        href: "/admin/dashboard/revenue",
        label: "Revenue",
      },
      {
        href: "/admin/dashboard/payments",
        label: "Payments",
      },
      {
        href: "/admin/dashboard/subscriptions",
        label: "Subscriptions",
      },
      {
        href: "/admin/dashboard/users",
        label: "Users",
      },
    ],
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: Users2,
    description: "Manage student accounts",
    children: [
      {
        href: "/admin/students",
        label: "List Students",
      },
    ],
  },
  {
    href: "/admin/lecturers",
    label: "Lecturers",
    icon: Users2,
    description: "Manage lecturers & approvals",
    children: [
      {
        href: "/admin/lecturers",
        label: "List Lecturers",
      },
      {
        href: "/admin/lecturers/pending-approval",
        label: "Pending Approval",
      },
    ],
  },
  {
    href: "/admin/staff",
    label: "Staff",
    icon: Users2,
    description: "Manage staff accounts",
    children: [
      {
        href: "/admin/staff",
        label: "List Staff",
      },
    ],
  },
  {
    href: "/admin/agent-train-ai",
    label: "Pattern Collection",
    icon: Users2,
    description: "Crawl orchestrator control center",
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
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    description: "Manage subscription plans",
    children: [
      {
        href: "/admin/subscriptions",
        label: "All Plans",
      },
      {
        href: "/admin/subscriptions/create",
        label: "Create Plan",
      },
      {
        href: "/admin/subscription-tiers",
        label: "Subscription Tiers",
      },
    ],
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
    description: "Manage payment activity",
    children: [
      {
        href: "/admin/payments",
        label: "Payments List",
      },
      {
        href: "/admin/payments/summary",
        label: "Summary & Analytics",
      },
    ],
  },
];
