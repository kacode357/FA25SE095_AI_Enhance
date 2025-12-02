import type React from "react";
import { Bell, Keyboard, LockKeyhole, User } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "My Profile",
    href: "/student/settings/my-profile",
    icon: User,
  },
  {
    label: "Change Password",
    href: "/student/settings/change-password",
    icon: LockKeyhole,
  },
  {
    label: "Hotkeys",
    href: "/student/settings/hotkeys",
    icon: Keyboard,
  },
  {
    label: "Notifications",
    href: "/student/settings/notifications",
    icon: Bell,
  },
];
