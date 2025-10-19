"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Xoá hết imports của hooks và types: useCourseCodeOptions, useUpdateCourse, CourseItem

export default function EditDialog({
  course,
  title,
  onSubmit,
  onCancel,
}: {
  // Giữ lại định nghĩa props tối thiểu
  course: any; 
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  // Xoá hết logic: useUpdateCourse, useCourseCodeOptions, useState, useEffect, matchedOption, form, loading, v.v.

  // Giả định các biến cần cho UI
  const loadingCodes = false; // Luôn hiển thị UI chính
  const editingCode = false; // Luôn hiển thị trạng thái không chỉnh sửa
  const loading = false;
  
  // Dữ liệu giả để hiển thị UI
  const mockCourse = course || { courseCode: "CODE", courseCodeTitle: "Title" };
  const mockForm = {
    courseCodeId: "MOCK_ID",
    description: "Mock Description",
    term: "Mock Term",
    year: 2024,
  };
  const mockCourseCodeOptions = [
      { id: '1', displayName: 'CS101 - Intro' }, 
      { id: '2', displayName: 'MA201 - Advanced' }
  ];

  // Hàm giả cho sự kiện
  const handleMockChange = (key: string, value: any) => {
    console.log(`Mock Change: ${key} = ${value}`);
  };

  const handleMockClick = () => {
    console.log("Mock Button Clicked");
  }

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      {/* Logic loadingCodes đã bị xoá, luôn hiển thị form */}
      <div className="space-y-4 py-2">
        {/* Course Code */}
        <div>
          <Label className="cursor-text">Course Code</Label>
          {!editingCode ? ( // Luôn là false
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-700">
                {mockCourse.courseCode} - {mockCourse.courseCodeTitle}
              </p>
              <Button
                variant="ghost"
                className="text-emerald-600 px-2 h-7 cursor-pointer"
                onClick={handleMockClick} // Đã thay thế logic setEditingCode
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                title="Code"
                value={mockForm.courseCodeId}
                onChange={(e) => handleMockChange("courseCodeId", e.target.value)}
                className="flex-1 border border-slate-300 rounded-md p-2 text-sm cursor-pointer"
              >
                <option value="">-- Select Course Code --</option>
                {mockCourseCodeOptions.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.displayName}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                className="text-slate-500 px-2 h-7 cursor-pointer"
                onClick={handleMockClick} // Đã thay thế logic setEditingCode
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="cursor-text">Description</Label>
          <Input
            value={mockForm.description}
            onChange={(e) => handleMockChange("description", e.target.value)}
          />
        </div>

        {/* Term */}
        <div>
          <Label className="cursor-text">Term</Label>
          <Input
            value={mockForm.term}
            onChange={(e) => handleMockChange("term", e.target.value)}
          />
        </div>

        {/* Year */}
        <div>
          <Label className="cursor-text">Year</Label>
          <Input
            type="number"
            value={mockForm.year}
            onChange={(e) => handleMockChange("year", parseInt(e.target.value))}
          />
        </div>
      </div>

      <DialogFooter>
        <Button 
          className="cursor-pointer" 
          onClick={handleMockClick} // Đã thay thế handleSave
          disabled={loading} // Giữ lại disabled với biến giả
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button className="cursor-pointer" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}