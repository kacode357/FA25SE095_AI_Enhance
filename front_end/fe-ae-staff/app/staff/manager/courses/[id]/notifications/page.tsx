"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const VALUE = 0;

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Notifications</h1>
        <Button onClick={() => router.push(`/staff/manager/courses/${id}`)}>← Back</Button>
      </div>

      <Card className="border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-700">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <Bell className="size-5" />
            </div>
            <span className="text-sm">Notifications</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{VALUE}</div>
        </CardContent>
      </Card>
    </div>
  );
}
