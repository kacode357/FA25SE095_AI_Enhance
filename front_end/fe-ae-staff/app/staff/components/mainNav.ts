import { GraduationCap, Headset, Layers3, UserRoundCheck } from "lucide-react";

export const mainNav = [
  {
    href: "/staff/approve-lecturer",
    label: "Approve Lecturers",
    icon: UserRoundCheck,
    description: "Approve Lecturer accounts",
  },
  {
    href: "/staff/terms",
    label: "Terms",
    icon: GraduationCap,
    description: "Manage academic terms",
    children: [
      { href: "/staff/terms", label: "All Terms" },
      { href: "/staff/terms/create", label: "Create Term" },
    ],
  },
  // Manager Course group (3-level menu)
  {
    href: "/staff/courses",
    label: "Manager Course",
    icon: Layers3,
    description: "Course management",
    children: [
      // Course Codes keeps its own children (2nd-level)
      {
        href: "/staff/course-codes",
        label: "Course Codes",
        children: [
          { href: "/staff/course-codes", label: "All Course Codes" },
          { href: "/staff/course-codes/create", label: "Create Course Code" },
        ],
      },
      // Sibling items under Manager Course
      { href: "/staff/courses", label: "Active Courses" },
      { href: "/staff/course-requests", label: "Course Requests" },
      { href: "/staff/course-approvals", label: "Course Approvals" },
    ],
  },
  {
    href: "/staff/support-requests",
    label: "Support Requests",
    icon: Headset,
    description: "Handle student support tickets",
  },
];