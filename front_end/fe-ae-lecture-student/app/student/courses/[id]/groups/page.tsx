"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  ArrowLeft,
  FileText,
  Eye,
} from "lucide-react";

export default function CourseGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params?.id === "string" ? params.id : "";

  const { listData, loading, fetchByCourseId, refetch } = useGroupsByCourseId();

  useEffect(() => {
    if (courseId) fetchByCourseId(courseId);
  }, [courseId, fetchByCourseId]);

  const onRefresh = () => {
    if (courseId) refetch(courseId);
  };

  if (!courseId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
        <FileText className="w-8 h-8 text-slate-400" />
        <p>Không tìm thấy <b>courseId</b> trong đường dẫn.</p>
        <Button variant="outline" onClick={() => router.push("/student/my-courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-green-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading groups…</span>
      </div>
    );
  }

  const isEmpty = !listData || listData.length === 0;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          Groups
        </h1>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/student/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <Button variant="secondary" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
          <CardContent className="py-10 text-center text-slate-600">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className="mb-4">Chưa có nhóm nào cho khóa học này.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải lại
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {listData.map((g) => (
            <Card
              key={g.id}
              className="rounded-2xl border border-slate-200 shadow-md bg-white hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-bold">{g.name}</CardTitle>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                      g.isLocked
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {g.isLocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" />
                        Open
                      </>
                    )}
                  </span>
                </div>
                {g.assignmentTitle && (
                  <p className="text-xs text-slate-500 mt-1">
                    Assignment: <b>{g.assignmentTitle}</b>
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-slate-700">
                {g.description && (
                  <p className="text-slate-600">{g.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>
                      <b>{g.memberCount}</b> / {g.maxMembers} members
                    </span>
                  </div>

                  {g.leaderName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">
                        Lead: <b>{g.leaderName}</b>
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 pt-1">
                  Created: {new Date(g.createdAt).toLocaleString("en-GB")}
                </div>

                {/* Actions */}
                <div className="pt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() =>
                      router.push(`/student/courses/${courseId}/groups/${g.id}`)
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View members
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
