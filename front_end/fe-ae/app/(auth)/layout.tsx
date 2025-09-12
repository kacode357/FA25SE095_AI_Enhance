import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth • AI Enhance",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
