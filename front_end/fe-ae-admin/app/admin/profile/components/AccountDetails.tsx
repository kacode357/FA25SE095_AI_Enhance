"use client";

import { AlertTriangle, BadgeCheck } from "lucide-react";
import { InfoItem, formatDateTime } from "./ProfileUI";

export default function AccountDetails({ user }: { user: any }) {
    return (
        <div className="card p-6">
            <h3 className="text-sm font-semibold text-nav mb-4">Account Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[var(--border)] bg-white p-3">
                    <div className="text-sm text-foreground mt-0.5 break-all">{user.email ?? "-"}</div>
                    {user.isEmailConfirmed ? (
                        <div className="flex items-center gap-1.5 text-xs mt-2 text-green-600">
                            <span>Email confirmed</span>
                            <BadgeCheck className="w-3.5 h-3.5" aria-hidden />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs mt-2 text-yellow-600">
                            <span>Unconfirmed email</span>
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                        </div>
                    )}
                </div>

                <InfoItem label="Last Login" value={formatDateTime(user.lastLoginAt)} />
                <InfoItem label="Updated At" value={formatDateTime(user.updatedAt)} />
            </div>
        </div>
    );
}
