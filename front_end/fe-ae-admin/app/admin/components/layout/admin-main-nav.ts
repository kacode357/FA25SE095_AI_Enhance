  import { Users2, Megaphone, CreditCard, LayoutDashboard } from "lucide-react";

  export const mainNav = [
    // 1. Thêm Dashboard ở đây
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Overview & system stats",
      children: [
        {
          href: "/admin",
          label: "Overview",
        },
      ],
    },
    // 2. Các mục cũ giữ nguyên
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