// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import RegisterShell from "@/components/auth/RegisterShell";
import RegisterForm from "./components/RegisterForm";
import RegisterSuccess from "./components/RegisterSuccess";


export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  // If the user is redirected back to this page with ?success=1 we prefer
  // to show the success component which reads the stored user from
  // localStorage. We also show success when localStorage already has the
  // `registerSuccessUser` key (e.g., refresh).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasQuery = params.get("success") === "1";
      const stored = localStorage.getItem("registerSuccessUser");
      if (hasQuery || stored) setShowSuccess(true);
    } catch (e) {
      setShowSuccess(false);
    }
  }, []);

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
