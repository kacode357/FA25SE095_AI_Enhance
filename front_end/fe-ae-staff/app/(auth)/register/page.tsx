// app/(auth)/register/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Registration disabled: redirect to login
export default function DisabledRegisterRedirect(){
  const router = useRouter();
  useEffect(()=>{ router.replace("/login"); },[router]);
  return null;
}
