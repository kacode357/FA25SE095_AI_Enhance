"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, ChevronLeft, Clock, Globe, Target, User } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { useAnnouncementDetail } from "@/hooks/announcements/useAnnouncementDetail";
import { dayLabel, parseServerDate, timeHHmm } from "@/utils/chat/time";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";

export default function AnnouncementDetailPage({ params }: { params: { id: string } }) {
    const { announcement, loading, fetchAnnouncement } = useAnnouncementDetail();

    useEffect(() => {
        (async () => {
            try {
                const resolved: any =
                    params && typeof (params as any).then === "function" ? await params : params;
                const id = resolved?.id;
                if (!id) return;
                await fetchAnnouncement(id);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [fetchAnnouncement]);

    const formatPublishedDate = (ts?: string) => {
        if (!ts) return "No date available";
        const d = parseServerDate(ts);
        if (Number.isNaN(d.getTime())) return "Invalid date";
        return `${dayLabel(d)}, ${d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })} at ${timeHHmm(d)}`;
    };

    const getAudienceInfo = (audience?: number) => {
        switch (audience) {
            case 0:
                return { label: "Everyone", icon: Globe, color: "bg-blue-50 text-blue-700 border-blue-200" };
            case 1:
                return { label: "Students only", icon: User, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
            case 2:
                return { label: "Lecturers only", icon: User, color: "bg-purple-50 text-purple-700 border-purple-200" };
            default:
                return { label: "Unknown", icon: Target, color: "bg-gray-100 text-gray-600" };
        }
    };

    const audience = announcement ? getAudienceInfo(announcement.audience) : null;

    return (
        <div className="min-h-screen mb-5 bg-gray-50/50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
                <div className="mx-auto max-w-5xl px-6 py-12">
                    <Link href="/lecturer/announcements">
                        <Button variant="ghost" size="sm" className="mb-8 text-white/90 hover:bg-white/10">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Announcements
                        </Button>
                    </Link>

                    {loading && !announcement ? (
                        <div className="space-y-6">
                            <div className="h-12 w-4/5 bg-white/20 rounded-2xl animate-pulse" />
                            <div className="h-8 w-3/5 bg-white/10 rounded-xl animate-pulse" />
                        </div>
                    ) : (
                        announcement && (
                            <>
                                <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                                    {announcement.title}
                                </h1>

                                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-white/80">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatPublishedDate(announcement.publishedAt)}
                                    </div>

                                    {audience && (
                                        <>
                                            <span className="opacity-50">•</span>
                                            <Badge variant="secondary" className={`${audience.color} border font-medium`}>
                                                <audience.icon className="mr-1.5 h-3 w-3" />
                                                {audience.label}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="mx-auto max-w-5xl px-6 -mt-15">
                {loading && !announcement ? (
                    <Card className="p-12">
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-4 bg-gray-200 rounded-full animate-pulse ${i % 2 === 0 ? "w-full" : "w-11/12"}`}
                                />
                            ))}
                        </div>
                    </Card>
                ) : !announcement ? (
                    <Card className="p-20 text-center">
                        <p className="text-lg text-gray-500">Announcement not found.</p>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border-0 shadow-2xl">
                        {/* Author Section */}
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-10 py-8 border-b border-slate-400">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl font-bold">
                                            {(announcement.createdByName || "AD")
                                                .split(" ")
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Posted by
                                        </p>
                                        <p className="text-xl font-semibold text-slate-900">
                                            {announcement.createdByName || "System Administrator"}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Published</p>
                                    <p className="font-medium text-gray-800">
                                        <span className="flex items-center justify-end gap-2">
                                            <Clock className="h-4 w-4" />
                                            {formatPublishedDate(announcement.publishedAt)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Announcement Content */}
                        <div className="px-10 py-7 lg:px-16 prose prose-lg max-w-none">
                            {announcement.content ? (
                                <div
                                    className="prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-3xl prose-h2:text-2xl prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:italic prose-ul:my-6 prose-li:my-2"
                                    dangerouslySetInnerHTML={{
                                        __html: normalizeAndSanitizeHtml(announcement.content),
                                    }}
                                />
                            ) : (
                                <p className="italic text-gray-500">No content provided.</p>
                            )}
                        </div>

                        <Separator />

                        {/* Footer */}
                        <div className="bg-slate-50/80 px-10 py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                                <span>Announcement ID: #{announcement.id}</span>

                                {audience && (
                                    <Badge variant="outline" className="mt-3 sm:mt-0 gap-1.5 font-medium">
                                        <Target className="h-3.5 w-3.5" />
                                        Audience: {audience.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}