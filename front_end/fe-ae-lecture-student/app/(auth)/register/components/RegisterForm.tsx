"use client";

import { passwordsMatch, validateConfirmPassword } from "@/utils/validators/confirmPassword";
import { isValidEmail, validateEmail } from "@/utils/validators/email";
import { isValidPhone, validatePhone } from "@/utils/validators/phone";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";

export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string>("0");
    const [step, setStep] = useState<number>(1);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Controlled values
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

            if (!res) return false;

            try {
                const displayUser: any = { ...payload };
                delete displayUser.password;
                // include any backend message so the success page can show it
                // backend may return message at top-level or under data/msg — be permissive
                const beMessage = (res as any)?.message ?? (res as any)?.msg ?? (res as any)?.data?.message ?? "";
                if (beMessage) displayUser.message = beMessage;
                // store avatar preview if present (client-only preview)
                if (avatarPreview) displayUser.avatarPreview = avatarPreview;
                localStorage.setItem("registerSuccessUser", JSON.stringify(displayUser));
            } catch (e) {
                // ignore storage errors
            }

            // Clear controlled inputs and avatar on definite success
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

            // Navigate to the registration success view on the same route
            // We use a query param so no extra folder/page is required.
            router.push("/register?success=1");
            return true;
        } catch (err) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const onNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        if (loading) return;

        if (step === 1 && !passwordsMatch(passwordValue, confirmValue)) {
            toast.error("Passwords do not match");
            return;
        }

        if (step === 1 && !isValidEmail(emailValue)) {
            toast.error("Please enter a valid email address");
            return;
        }

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

        if (step < 2) {
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
        <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-4">
            {/* Stepper header */}
            <div className="mb-7">
                <div className="flex items-center gap-3 w-full max-w-full">
                    {["Your Account", "Profile Information"].map((label, i) => {
                        const idx = i + 1;
                        const active = idx === step;
                        const done = idx < step;
                        return (
                            <div key={label} className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`flex-1 min-w-0 text-[11px] md:text-[12px] text-center py-1 px-2 rounded-full ${active ? 'bg-violet-100 text-violet-800 font-medium' : done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <div className="uppercase tracking-tight font-medium truncate">{label}</div>
                                </div>
                                {i < 1 && <div className={`h-1 w-6 md:w-8 rounded-full flex-none ${idx < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Role selector */}
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium leading-none">Register as</div>
                <Tabs defaultValue={role} value={role} onValueChange={(v) => setRole(v)}>
                    <TabsList className="bg-transparent rounded-full p-1">
                        <TabsTrigger value="0" className={"px-3 cursor-pointer py-1.5 rounded-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-violet-800 data-[state=active]:shadow-md data-[state=active]:font-medium"}>Student</TabsTrigger>
                        <TabsTrigger value="1" className={"px-3 cursor-pointer py-1.5 rounded-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-violet-800 data-[state=active]:shadow-md data-[state=active]:font-medium"}>Lecturer</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {step === 1 && (
                <div className="space-y-5">
                    <div className="flex flex-row gap-4">
                        <Input className="text-sm" name="firstName" label="First name" placeholder="Jane" required value={firstNameValue} onChange={(e) => setFirstNameValue(e.currentTarget.value)} />
                        <Input className="text-sm" name="lastName" label="Last name" placeholder="Doe" required value={lastNameValue} onChange={(e) => setLastNameValue(e.currentTarget.value)} />
                    </div>

                    <div className="flex flex-row gap-4">
                        <Input className="text-sm" type="email" name="email" label="Email" placeholder="you@example.com" required value={emailValue} onChange={(e) => setEmailValue(e.currentTarget.value)} error={emailError} />
                    </div>

                    <div className="flex flex-row gap-4">
                        <Input className="text-sm" type="password" name="password" label="Password" placeholder="••••••••••" required value={passwordValue} onChange={(e) => setPasswordValue(e.currentTarget.value)} />
                        <Input className="text-sm" type="password" name="confirm" label="Confirm password" placeholder="Re-enter password" required value={confirmValue} onChange={(e) => setConfirmValue(e.currentTarget.value)} error={confirmError} />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-5">
                    <Input className="text-sm" name="institutionName" label="Institution name" placeholder="University / Company" value={institutionNameValue} onChange={(e) => setInstitutionNameValue(e.currentTarget.value)} />
                    <div className="flex flex-row gap-4">
                        <Input className="text-sm" name="phoneNumber" label="Phone number" placeholder="10 digits, numbers only" value={phoneValue} onChange={(e) => setPhoneValue(e.currentTarget.value)} error={phoneError} />
                        <Input className="text-sm" type="email" name="institutionEmail" label="Institution email" placeholder="dept@example.edu" value={institutionEmailValue} onChange={(e) => setInstitutionEmailValue(e.currentTarget.value)} error={institutionEmailError} />
                    </div>

                    <div className="flex flex-row gap-4">
                        <Input className="text-sm" name="department" label="Department" placeholder="e.g. Computer Science" value={departmentValue} onChange={(e) => setDepartmentValue(e.currentTarget.value)} />
                        <Input className="text-sm" name="position" label="Position" placeholder="e.g. Lecturer / Researcher" value={positionValue} onChange={(e) => setPositionValue(e.currentTarget.value)} />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-8">
                <div className="hover:text-violet-800">
                    <a className="text-sm text-slate-500" href="/login">&larr; Back to Login</a>
                </div>

                <div className="flex items-center gap-3">
                    {step > 1 && (
                        <Button variant="ghost" onClick={onBack} className="hidden text-sm text-violet-800 hover:text-violet-500 md:inline-flex">Previous</Button>
                    )}

                    <Button onClick={onNext} className="btn text-sm btn-gradient-slow" disabled={Boolean(loading || (step === 1 && (!passwordsMatch(passwordValue, confirmValue) || !isValidEmail(emailValue))) || (step === 2 && ((phoneValue && !isValidPhone(phoneValue)) || (institutionEmailValue && !isValidEmail(institutionEmailValue)))))}>
                        {loading ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing…</span>
                        ) : (
                            step < 2 ? "Next Step" : "Create account"
                        )}
                    </Button>
                </div>
            </div>

            <div className="text-center text-xs text-slate-500">By continuing, you agree to our <a href="#" className="text-green-600 underline" rel="nofollow">Terms &amp; Conditions</a> and <a href="#" className="text-green-600 underline" rel="nofollow">Privacy Policy</a>.</div>
        </form>
    );
}
