import { LockKeyhole, User } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "My Profile", href: "/admin/profile/my-profile", icon: User },
  { label: "Change Password", href: "/admin/profile/change-password", icon: LockKeyhole },
];
