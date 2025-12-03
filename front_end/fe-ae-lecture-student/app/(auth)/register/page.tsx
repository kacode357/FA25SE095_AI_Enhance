// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import RegisterShell from "@/components/auth/RegisterShell";
import RegisterForm from "./components/RegisterForm";
import RegisterSuccess from "./components/RegisterSuccess";


export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasStoredUser, setHasStoredUser] = useState(false);

  // Track whether local/session storage contains the success payload
  useEffect(() => {
    try {
      const stored = localStorage.getItem("registerSuccessUser") || sessionStorage.getItem("registerSuccessUser");
      setHasStoredUser(Boolean(stored));
    } catch {
      setHasStoredUser(false);
    }
  }, [searchParams]);

  const hasQuerySuccess = useMemo(() => searchParams?.get("success") === "1", [searchParams]);
  const showSuccess = hasQuerySuccess || hasStoredUser;

  // Existing form state is kept inside the `RegisterForm` component to keep
  // this page file tidy. We only need to decide which view to show.

  return (
    <RegisterShell
      title={showSuccess ? "" : "Create your account"}
      subtitle={
        showSuccess ? undefined : (
          <span>
            Already have an account?{" "}
            <Link className="underline" href="/login">
              Sign in
            </Link>
          </span>
        )
      }
    >
      {showSuccess ? <RegisterSuccess /> : <RegisterForm />}
    </RegisterShell>
  );
}
