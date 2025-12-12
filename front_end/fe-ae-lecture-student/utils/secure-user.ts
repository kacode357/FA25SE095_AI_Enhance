// utils/secure-user.ts
"use client";

import Cookies from "js-cookie";
import type { UserProfile } from "@/types/user/user.response";
import { useEffect, useState } from "react";

const STORAGE_KEY = "a:u";
const ENC_KEY = process.env.NEXT_PUBLIC_CLIENT_ENC_KEY || "cdp-dev-key";
const IV_BYTES = 12;
const REMEMBER_EXPIRES_DAYS = 7;
const SHORT_SESSION_MINUTES = 59;
const SHORT_SESSION_EXPIRES_DAYS = SHORT_SESSION_MINUTES / (24 * 60);
const COOKIE_OPTS_BASE = { secure: true, sameSite: "strict" as const, path: "/" as const };

const te = new TextEncoder();
const td = new TextDecoder();

function cookieOpts(remember: boolean) {
  return { ...COOKIE_OPTS_BASE, expires: remember ? REMEMBER_EXPIRES_DAYS : SHORT_SESSION_EXPIRES_DAYS };
}

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
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptJSON(obj: unknown): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plain = te.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
  return `${b64enc(iv.buffer)}.${b64enc(ct)}`; // iv.cipher
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

/** Lưu user đã mã hoá: remember=true -> cookie 7 ngày, false -> cookie 30 phút */
export async function saveEncodedUser(user: UserProfile | null, remember: boolean): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY); // dọn dữ liệu cũ
  } catch {}
  Cookies.remove(STORAGE_KEY, { path: "/" });

  if (!user) return;
  const blob = await encryptJSON(user);
  Cookies.set(STORAGE_KEY, blob, cookieOpts(remember));
}

/** Đọc user đã mã hoá: cookie only */
export async function loadDecodedUser(): Promise<UserProfile | null> {
  if (typeof window === "undefined") return null;
  const blob = Cookies.get(STORAGE_KEY);

  // clean legacy sessionStorage copy if it still exists
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {}

  if (!blob) return null;
  try {
    const obj = await decryptJSON(blob);
    return obj as UserProfile;
  } catch {
    Cookies.remove(STORAGE_KEY, { path: "/" });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    return null;
  }
}

/** Xoá cả hai nơi */
export function clearEncodedUser(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
  Cookies.remove(STORAGE_KEY, { path: "/" });
}

export function useDecodedUser() {
  const [decoded, setDecoded] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    loadDecodedUser()
      .then((u) => {
        if (mounted) setDecoded(u);
      })
      .catch(() => {
        if (mounted) setDecoded(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return decoded;
}
