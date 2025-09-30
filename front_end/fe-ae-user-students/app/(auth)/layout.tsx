import { AuthLoadingProvider } from "@/components/auth/AuthLoadingProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth • AI Enhance",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-scope">
      <AuthLoadingProvider>{children}</AuthLoadingProvider>
    </div>
  );
}
