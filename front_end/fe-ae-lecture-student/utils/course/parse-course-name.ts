// utils/course/parse-course-name.ts
export type ParsedCourseName = {
  /** Chuỗi raw từ BE trả về */
  raw: string;
  /** PHYS301 */
  courseCode: string;
  /** K3I17J (unicode / class code) */
  classCode: string;
  /** Smith John */
  lecturerName: string;
};

/**
 * Parse format: "PHYS301#K3I17J - Smith John"
 * - PHYS301 = courseCode
 * - K3I17J  = classCode (unicode)
 * - Smith John = lecturerName
 */
export function parseCourseName(raw?: string | null): ParsedCourseName {
  const trimmed = (raw ?? "").trim();

  if (!trimmed) {
    return {
      raw: "",
      courseCode: "",
      classCode: "",
      lecturerName: "",
    };
  }

  // "PHYS301#K3I17J - Smith John"
  const [left, ...rightParts] = trimmed.split(" - ");
  const lecturerName = rightParts.join(" - ").trim(); // phòng TH tên có " - "

  // "PHYS301#K3I17J"
  let courseCode = left.trim();
  let classCode = "";

  if (left.includes("#")) {
    const [code, ...restClass] = left.split("#");
    courseCode = code.trim();
    classCode = restClass.join("#").trim();
  }

  return {
    raw: trimmed,
    courseCode,
    classCode,
    lecturerName,
  };
}
