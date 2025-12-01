// app/(auth)/register/page.tsx
"use client";

import { passwordsMatch, validateConfirmPassword } from "@/utils/validators/confirmPassword";
import { isValidEmail, validateEmail } from "@/utils/validators/email";
import { isValidPhone, validatePhone } from "@/utils/validators/phone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import RegisterShell from "@/components/auth/RegisterShell";
import RegisterForm from "./components/RegisterForm";

import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("0");
  const [step, setStep] = useState<number>(1); // 1..3
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Controlled values for real-time validation
  const [passwordValue, setPasswordValue] = useState<string>("");
  const [confirmValue, setConfirmValue] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [institutionEmailValue, setInstitutionEmailValue] = useState<string>("");
  const [firstNameValue, setFirstNameValue] = useState<string>("");
  const [lastNameValue, setLastNameValue] = useState<string>("");
  const [institutionNameValue, setInstitutionNameValue] = useState<string>("");
  const [departmentValue, setDepartmentValue] = useState<string>("");
  const [positionValue, setPositionValue] = useState<string>("");
  const [studentIdValue, setStudentIdValue] = useState<string>("");
  const confirmError = validateConfirmPassword(passwordValue, confirmValue);
  const emailError = validateEmail(emailValue);
  const phoneError = validatePhone(phoneValue);
  const institutionEmailError = validateEmail(institutionEmailValue);

  const handleAvatarChange = (file?: File) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const submitRegistration = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return false;
    }

    const get = (key: string) => {
      const v = String(formData.get(key) ?? "").trim();
      return v === "" ? undefined : v;
    };

    // Build payload from controlled state where available so we can preserve
    // user-entered values on failure (avoid relying on form.reset)
    const payload: RegisterPayload = {
      email: emailValue || String(formData.get("email") ?? "").trim(),
      password,
      firstName: firstNameValue || String(formData.get("firstName") ?? "").trim(),
      lastName: lastNameValue || String(formData.get("lastName") ?? "").trim(),
      role: Number(role),
      phoneNumber: phoneValue || get("phoneNumber"),
      institutionName: institutionNameValue || get("institutionName"),
      institutionEmail: institutionEmailValue || get("institutionEmail"),
      department: departmentValue || get("department"),
      position: positionValue || get("position"),
      studentId: studentIdValue || get("studentId"),
    };

    setLoading(true);
    try {
      const res: RegisterResponse = await AuthService.register(payload as any);

      // Only treat it as a full success if the backend returned a valid userId.
      // Some backends may return 200 with an error-like payload — guard against
      // that so we don't clear the form unexpectedly.
      if (!res || !res.userId) {
        return false;
      }

      // Do not show a client-side toast here — the axios interceptor will
      // surface the BE-provided message on errors. Proceed to clear state
      // only on definite success so user data is preserved on failure.
      // Clear controlled inputs
      setPasswordValue("");
      setConfirmValue("");
      setEmailValue("");
      setPhoneValue("");
      setInstitutionEmailValue("");
      setFirstNameValue("");
      setLastNameValue("");
      setInstitutionNameValue("");
      setDepartmentValue("");
      setPositionValue("");
      setStudentIdValue("");
      setAvatarFile(null);
      setAvatarPreview(null);

      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }
      return true;
    } catch (err) {
      // Let the axios response interceptor show the server message/toast.
      // Stay on the register page so the user can correct input. Do NOT clear
      // any form data here.
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (loading) return;

    // Prevent advancing from step 1 if passwords don't match
    if (step === 1 && !passwordsMatch(passwordValue, confirmValue)) {
      toast.error("Passwords do not match");
      return;
    }

    if (step === 1 && !isValidEmail(emailValue)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Step 2 validations: phone and institution email (if provided) must be valid
    if (step === 2) {
      if (phoneValue && !isValidPhone(phoneValue)) {
        toast.error("Phone number must be 10 digits");
        return;
      }
      if (institutionEmailValue && !isValidEmail(institutionEmailValue)) {
        toast.error("Please enter a valid institution email address");
        return;
      }
    }

    if (step < 3) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const form = document.querySelector("form") as HTMLFormElement | null;
    if (form) {
      await submitRegistration(form);
    }
  };

  const onBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <RegisterShell
      title="Create your account"
      subtitle={
        <span>
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </RegisterShell>
  );
}
