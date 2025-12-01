"use client";

import { CircleFadingArrowUp, Loader2 } from "lucide-react";
import React from "react";
import { initials } from "./ProfileUI";

export default function HeaderSection({
    user,
    preview,
    onAvatarChange,
    uploading,
    fileInputRef,
    fullName,
}: {
    user: any;
    preview: string | null;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    uploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    fullName: string;
}) {
    return (
        <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="relative group" aria-hidden>
                    <div
                        className="h-28 w-28 rounded-xl overflow-hidden grid place-items-center text-base font-semibold border border-[var(--border)]"
                        style={{
                            color: "var(--brand-700)",
                            background: "color-mix(in oklab, var(--brand) 10%, white)",
                        }}
                    >
                        {preview ? (
                            <img src={preview} alt="avatar preview" className="h-full w-full object-cover" />
                        ) : (user as any).profilePictureUrl ? (
                            <img src={(user as any).profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
                        ) : (
                            initials(user.firstName, user.lastName)
                        )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 opacity-0 group-hover:opacity-100">
                        <div className="absolute inset-0 cursor-pointer bg-white/50" aria-hidden />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative z-10 rounded cursor-pointer text-nav text-sm flex items-center gap-2"
                            aria-label="Upload avatar"
                            disabled={uploading}
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            <CircleFadingArrowUp className="w-5 h-5 text-violet-500" />
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        aria-hidden="true"
                        aria-label="Upload avatar"
                        className="hidden"
                        onChange={onAvatarChange}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-nav break-words">{fullName || user.email}</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your personal and institution information.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
                            <div className="text-sm flex items-center text-nav font-medium">Role: <span className="font-normal text-foreground/80 ml-2">{user.role || "—"}</span></div>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
                            <div className="text-sm flex items-center text-nav font-medium">Account Status: <span className="font-normal text-foreground/80 ml-2">{user.status || "—"}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
