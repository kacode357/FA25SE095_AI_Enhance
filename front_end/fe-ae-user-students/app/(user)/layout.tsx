import type { Metadata } from "next";
import UserLayoutClient from "./layout.client";

export const metadata: Metadata = {
  title: "AE - User",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
