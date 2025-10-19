import { User, LockKeyhole } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "My Profile", href: "/student/profile/my-profile", icon: User },
  { label: "Change Password", href: "/student/profile/change-password", icon: LockKeyhole },
];
