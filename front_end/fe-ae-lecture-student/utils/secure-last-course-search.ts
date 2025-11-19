// utils/secure-last-course-search.ts
"use client";

import Cookies from "js-cookie";

const STORAGE_KEY = "a:lc"; // last courses
const ENC_KEY = process.env.NEXT_PUBLIC_CLIENT_ENC_KEY || "cdp-dev-key";
const IV_BYTES = 12;
const COOKIE_OPTS = {
  secure: true,
  sameSite: "strict" as const,
  path: "/" as const,
  expires: 7,
};

const te = new TextEncoder();
const td = new TextDecoder();

export type LastSearchedCourse = {
  id: string;
  uniqueCode: string;
  courseCode: string;
  name: string;
  img: string | null;
  department: string | null;
  isEnrolled: boolean;
  searchedAt: string; // ISO
};

function b64enc(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64dec(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

async function deriveKey(): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", te.encode(ENC_KEY));
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptJSON(obj: unknown): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plain = te.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  return `${b64enc(iv.buffer)}.${b64enc(ct)}`;
}

async function decryptJSON(blob: string): Promise<any> {
  const [ivB64, ctB64] = blob.split(".");
  if (!ivB64 || !ctB64) throw new Error("invalid blob");
  const key = await deriveKey();
  const iv = new Uint8Array(b64dec(ivB64));
  const ct = b64dec(ctB64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(td.decode(plain));
}

/** Đọc history các course gần nhất (tối đa 4) */
export async function loadLastSearchedCourses(): Promise<LastSearchedCourse[]> {
  if (typeof window === "undefined") return [];
  const blob = Cookies.get(STORAGE_KEY);
  if (!blob) return [];

  try {
    const obj = await decryptJSON(blob);

    // Backward-compat: nếu trước đây lưu single object
    if (Array.isArray(obj)) {
      return obj as LastSearchedCourse[];
    }
    if (obj && typeof obj === "object") {
      return [obj as LastSearchedCourse];
    }
    return [];
  } catch {
    Cookies.remove(STORAGE_KEY, { path: "/" });
    return [];
  }
}

/** Lấy course mới, merge với history cũ, giữ tối đa 4, rồi lưu lại */
export async function saveLastSearchedCourseFromResponse(result: {
  course?: any;
  isEnrolled?: boolean;
}): Promise<LastSearchedCourse[]> {
  if (typeof window === "undefined") return [];

  const course = result.course;
  if (!course || !course.id) return [];

  const newItem: LastSearchedCourse = {
    id: course.id,
    uniqueCode: course.uniqueCode ?? "",
    courseCode: course.courseCode ?? "",
    name: course.name ?? "",
    img: course.img ?? null,
    department: course.department ?? null,
    isEnrolled: Boolean(result.isEnrolled),
    searchedAt: new Date().toISOString(),
  };

  let existing: LastSearchedCourse[] = [];
  try {
    existing = await loadLastSearchedCourses();
  } catch {
    existing = [];
  }

  // Bỏ trùng theo id hoặc uniqueCode
  const merged = [
    newItem,
    ...existing.filter(
      (c) => c.id !== newItem.id && c.uniqueCode !== newItem.uniqueCode
    ),
  ].slice(0, 4); // ✅ giữ tối đa 4 course gần nhất

  try {
    const blob = await encryptJSON(merged);
    Cookies.set(STORAGE_KEY, blob, COOKIE_OPTS);
  } catch {
    // ignore encrypt error
  }

  return merged;
}

/** Helper cho nơi nào còn xài bản cũ – trả về course mới nhất */
export async function loadLastSearchedCourse(): Promise<LastSearchedCourse | null> {
  const list = await loadLastSearchedCourses();
  return list[0] ?? null;
}

/** Xoá history */
export function clearLastSearchedCourses(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(STORAGE_KEY, { path: "/" });
}
