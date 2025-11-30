import { FileSpreadsheet, FileText, GraduationCap, Layers3, LifeBuoy, UserRoundCheck } from "lucide-react";

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
  {
    href: "/staff/course-codes",
    label: "Course Codes",
    icon: Layers3,
    description: "Manage your course codes",
    children: [
      { href: "/staff/course-codes", label: "All Course Codes" },
      { href: "/staff/course-codes/create", label: "Create Course Code" },
    ],
  },
  {
    href: "/staff/course-requests",
    label: "Course Requests",
    icon: FileText,
    description: "View and process course requests",
  },
  {
    href: "/staff/courses",
    label: "Courses",
    icon: GraduationCap,
    description: "Manage active courses and enrollments",
  },
  {
    href: "/staff/course-approvals",
    label: "Course Approvals",
    icon: FileText,
    description: "Review and approve pending courses",
  },
  {
    href: "/staff/support-requests",
    label: "Support Requests",
    icon: LifeBuoy,
    description: "Handle student support tickets",
  },
  {
    href: "/staff/enrollments",
    label: "Import Enrollments",
    icon: FileSpreadsheet,
    description: "Bulk import students via Excel",
  },
];