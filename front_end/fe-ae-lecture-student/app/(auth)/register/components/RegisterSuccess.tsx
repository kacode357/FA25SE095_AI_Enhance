"use client";

import { Button } from "@/components/ui/button";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import { ArrowRight, Briefcase, Building2, CheckCircle2, Mail, Phone, School, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type StoredUser = Partial<RegisterPayload> & { role?: number; message?: string };

export default function RegisterSuccessPage() {
    const router = useRouter();
    const [user, setUser] = useState<StoredUser | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("registerSuccessUser") || sessionStorage.getItem("registerSuccessUser");
            if (raw) setUser(JSON.parse(raw));
        } catch {
            setUser(null);
        }
    }, []);

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
    const roleLabel = user?.role === 1 ? "Lecturer" : user?.role === 0 ? "Student" : "—";

    const infoItems = [
        { icon: User, label: "Full name", value: fullName },
        { icon: Mail, label: "Email", value: user?.email ?? "—" },
        { icon: Phone, label: "Phone", value: user?.phoneNumber ?? "—" },
        { icon: Briefcase, label: "Role", value: roleLabel },
        { icon: Building2, label: "Institution", value: user?.institutionName ?? "—" },
        { icon: Mail, label: "Institution email", value: user?.institutionEmail ?? "—" },
        { icon: School, label: "Department", value: user?.department ?? "—" },
        { icon: Briefcase, label: "Position", value: user?.position ?? "—" },
    ];

    return (
            <div className="w-full max-w-ful -mx-5 -mb-5 justify-center items-center mx-auto">
                {/* Main Card - Clean & Modern */}
                    {/* Header with Success Icon */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg -mx-auto py-5 text-white text-center">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2" strokeWidth={2} />
                        <h1 className="text-2xl font-bold">Registration Successful!</h1>
                        <p className="mt-2 text-emerald-50">{user?.message ?? "Your account has been created successfully."}</p>
                    </div>

                    {/* User Info Grid - Horizontal, responsive */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {infoItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-4 h-4 text-purple-600" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">{label}</p>
                                        <p className="font-normal text-gray-800 truncate">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="px-8 pb-8">
                        <Button
                            onClick={() => {
                                try {
                                    localStorage.removeItem("registerSuccessUser");
                                    sessionStorage.removeItem("registerSuccessUser");
                                } catch {}
                                router.push("/login");
                            }}
                            className="w-full mt-3 h-12 text-lg font-medium btn btn-gradient-slow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            Login Now
                            <ArrowRight className="w-5 h-5" />
                        </Button>

                        <p className="text-center text-xs text-gray-500 mt-6">
                            If any information is incorrect, please{" "}
                            <span className="text-purple-600 font-medium">contact the administrator</span> or register again.
                        </p>
                    </div>
                </div>
    );
}