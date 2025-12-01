import { LockKeyhole, User } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "My Profile", href: "/staff/profile/my-profile", icon: User },
  { label: "Change Password", href: "/staff/profile/change-password", icon: LockKeyhole },
];
