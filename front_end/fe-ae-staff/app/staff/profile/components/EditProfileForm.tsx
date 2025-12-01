"use client";

import React from "react";
import { Field } from "./ProfileUI";

export default function EditProfileForm({
    form,
    onChange,
    onSubmit,
    isDirty,
    loading,
    resetForm,
    safeStr,
}: {
    form: any;
    onChange: (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => Promise<void> | void;
    isDirty: boolean;
    loading: boolean;
    resetForm: () => void;
    safeStr: (v: unknown) => string;
}) {
    return (
        <div className="card p-6">
            <h3 className="text-sm font-semibold text-nav mb-4">Edit Profile</h3>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="First Name">
                        <input className="input" placeholder="First name" value={form.firstName} onChange={onChange("firstName") as any} />
                    </Field>

                    <Field label="Last Name">
                        <input className="input" placeholder="Last name" value={form.lastName} onChange={onChange("lastName") as any} />
                    </Field>

                    <Field label="Department" span={2}>
                        <input className="input" placeholder="Digital Marketing" value={form.department} onChange={onChange("department") as any} />
                    </Field>

                    <Field label="Institution Name" span={2}>
                        <input className="input" placeholder="University / Organization" value={form.institutionName} onChange={onChange("institutionName") as any} />
                    </Field>

                    <Field label="Institution Address" span={2}>
                        <input className="input" placeholder="Address" value={form.institutionAddress} onChange={onChange("institutionAddress") as any} />
                    </Field>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="submit" className={`btn btn-green-slow ${loading || !isDirty ? "opacity-70 cursor-not-allowed" : ""}`} disabled={loading || !isDirty}>
                        {loading ? (
                            <>
                                <span className="w-4 h-4 animate-spin inline-block" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>

                    <button type="button" className={`btn bg-white border border-brand text-nav hover:bg-slate-100 ${loading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={loading} onClick={resetForm}>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
}
