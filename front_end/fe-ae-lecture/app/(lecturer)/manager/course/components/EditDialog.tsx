"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { CourseService } from "@/services/course.services";
import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";

export default function EditDialog({
  courseId,
  title,
  onSubmit,
  onCancel,
}: {
  courseId: string;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { updateCourse, loading } = useUpdateCourse();
  // listData ở đây là danh sách course codes
  const { listData: courseCodes, fetchCourseCodes } = useCourseCodes(); 

  const [form, setForm] = useState({
    courseCodeId: "",
    description: "",
    term: "",
    year: new Date().getFullYear(),
  });

  const [currentCourseCode, setCurrentCourseCode] = useState<string>(""); 
  const [loadingData, setLoadingData] = useState(true); // Giữ là true để ban đầu hiển thị Loading
  const [editingCode, setEditingCode] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.courseCodeId) {
      console.error("Missing courseCodeId");
      return;
    }

    const res = await updateCourse({
      courseId,
      courseCodeId: form.courseCodeId,
      description: form.description,
      term: form.term,
      year: form.year,
    });

    if (res?.success) {
      onSubmit();
    }
  };

  // Logic load dữ liệu đã được sửa 
  useEffect(() => {
    if (!courseId) return;

    const loadData = async () => {
      setLoadingData(true);
      
      try {
        // 1. Luôn đảm bảo fetch course codes trước và đợi kết quả
        // Tao gọi fetch ở đây để nó cập nhật state `courseCodes` (listData)
        // và đảm bảo nó chạy trước khi lấy chi tiết.
        if (courseCodes.length === 0) {
            await fetchCourseCodes({ page: 1, pageSize: 100, isActive: true });
        }

        // 2. Fetch chi tiết khóa học
        const res = await CourseService.getCourseById(courseId);

        // tên courseCode hiện tại (hiển thị cho user)
        setCurrentCourseCode(`${res.course.courseCode} - ${res.course.courseCodeTitle}`);

        // 3. Map từ courseCode string -> id
        // Dùng listData hiện tại. Nếu bước 1 load data thành công, 
        // nó sẽ nằm trong `courseCodes` (listData) trong lần render tiếp theo.
        // NHƯNG: vì `useEffect` này chỉ phụ thuộc vào `courseId`, 
        // lần đầu chạy, `courseCodes` có thể vẫn là mảng rỗng.
        
        // 🌟 CÁCH GIẢI QUYẾT TỐT NHẤT: Tách làm 2 bước và dùng dependency array!

      } catch (err) {
        console.error("Failed to fetch course detail", err);
        setLoadingData(false);
      }
    };
    
    // Nếu chưa có code list thì gọi load data
    if (courseCodes.length === 0) {
        loadData();
    } else {
        // Nếu đã có code list, thì load detail và set form
        const loadDetailAndSetForm = async () => {
             try {
                // Fetch chi tiết khóa học
                const res = await CourseService.getCourseById(courseId);

                // tên courseCode hiện tại
                setCurrentCourseCode(`${res.course.courseCode} - ${res.course.courseCodeTitle}`);

                // Map (Sử dụng courseCodes đã có)
                const matched = courseCodes.find((cc) => cc.code === res.course.courseCode);

                setForm({
                    // Đảm bảo có ID, nếu không nút Save sẽ disabled
                    courseCodeId: matched ? matched.id : "", 
                    description: res.course.description,
                    term: res.course.term,
                    year: res.course.year,
                });
             } catch (err) {
                 console.error("Failed to fetch course detail", err);
             } finally {
                 setLoadingData(false);
             }
        }
        loadDetailAndSetForm();
    }

  // Dependency array: Phụ thuộc vào courseId và listData.length.
  // Nếu listData.length thay đổi (sau khi fetch thành công), 
  // useEffect sẽ chạy lại và đi vào nhánh `else` để load chi tiết và set form.
  }, [courseId, courseCodes.length]); 

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      {loadingData ? (
        <div className="py-6 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Course Code */}
          <div>
            <Label>Course Code</Label>
            {!editingCode ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{currentCourseCode}</p>
                <Button
                  variant="ghost"
                  className="text-emerald-600 px-2 h-7"
                  onClick={() => setEditingCode(true)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={form.courseCodeId}
                  onChange={(e) => handleChange("courseCodeId", e.target.value)}
                  className="flex-1 border border-slate-300 rounded-md p-2 text-sm"
                >
                  <option value="">-- Select Course Code --</option>
                  {courseCodes.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.code} - {cc.title}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  className="text-slate-500 px-2 h-7"
                  onClick={() => setEditingCode(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div>
            <Label>Term</Label>
            <Input
              value={form.term}
              onChange={(e) => handleChange("term", e.target.value)}
            />
          </div>

          <div>
            <Label>Year</Label>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => handleChange("year", parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSave} disabled={loading || !form.courseCodeId}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}