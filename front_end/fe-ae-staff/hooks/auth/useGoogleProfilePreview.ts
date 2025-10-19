// hooks/auth/useGoogleProfilePreview.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
};

type GoogleButtonOptions = {
  // Tham số vẽ nút theo GIS: https://developers.google.com/identity/gsi/web/reference/js-reference#G_id_onload
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string; // vd "320"
  locale?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

/** Load script tiện dụng */
function useLoadScript(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    if (typeof window === "undefined") return;

    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    let created = false;

    const handleLoad = () => {
      if (mountedRef.current) setLoaded(true);
    };
    const handleError = () => {
      if (mountedRef.current) setError(new Error(`Failed to load ${src}`));
    };

    if (script) {
      // script đã có sẵn (dùng chung giữa nhiều component)
      handleLoad();
    } else {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
      document.head.appendChild(script);
      created = true;
    }

    return () => {
      mountedRef.current = false;
      if (script) {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
        // Không remove script tag để component khác còn dùng.
      }
    };
  }, [src]);

  return { loaded, error };
}


/** Decode payload JWT (ID token) đơn giản */
function decodeJwt<T = any>(jwt: string): T | null {
  try {
    const [, payload] = jwt.split(".");
    // sửa base64url → base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function useGoogleProfilePreview() {
  // ---- OAuth (access_token → userinfo) ----
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<GoogleProfile | null>(null);

  // ---- Credential (ID token) ----
  const [credential, setCredential] = useState<string | null>(null);
  const [credentialPayload, setCredentialPayload] = useState<any | null>(null);

  // ---- Error chung cho cả 2 flow ----
  const [error, setError] = useState<string | null>(null);

  // Refs giữ client instance
  const tokenClientRef = useRef<any>(null); // oauth2.initTokenClient
  const idInitedRef = useRef<boolean>(false); // accounts.id.initialize đã init?

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_CLIENT_ID ||
    "";

  // Load Google Identity Services
  const { loaded: gsiLoaded, error: gsiErr } = useLoadScript(
    "https://accounts.google.com/gsi/client"
  );

  const ready = useMemo(
    () => gsiLoaded && !!clientId && !gsiErr,
    [gsiLoaded, clientId, gsiErr]
  );

  // --- Init OAuth token client (access_token) ---
  const ensureOAuthClient = useCallback(() => {
    if (!ready) throw new Error("Google SDK chưa sẵn sàng hoặc thiếu CLIENT_ID.");
    if (tokenClientRef.current) return tokenClientRef.current;

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: async (tokenResponse: { access_token?: string; error?: string }) => {
        if (!tokenResponse?.access_token) {
          setError(tokenResponse?.error || "Không nhận được access_token");
          setLoading(false);
          return;
        }
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          const data = (await res.json()) as GoogleProfile;
          setProfile(data);
        } catch (e: any) {
          setError(e?.message || "Lỗi khi gọi userinfo");
        } finally {
          setLoading(false);
        }
      },
    });

    return tokenClientRef.current;
  }, [clientId, ready]);

  // --- Init Credential (ID token) ---
  const ensureIdInit = useCallback(() => {
    if (!ready) throw new Error("Google SDK chưa sẵn sàng hoặc thiếu CLIENT_ID.");
    if (idInitedRef.current) return;

    // Callback khi nhận được credential (ID token)
    const handleCredential = (resp: { credential?: string }) => {
      if (!resp?.credential) {
        setError("Không nhận được credential");
        return;
      }
      setCredential(resp.credential);
      setCredentialPayload(decodeJwt(resp.credential));
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      // auto_select: false, // nếu muốn tự pick account
      callback: handleCredential,
      // use_fedcm_for_prompt: true, // có thể bật nếu muốn dùng FedCM
    });

    idInitedRef.current = true;
  }, [clientId, ready]);

  // ---- Flow 1: OAuth access_token (như cũ) ----
  const loginGooglePreview = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const client = ensureOAuthClient();
      client.requestAccessToken({ prompt: "consent" });
    } catch (e: any) {
      setError(e?.message || "Lỗi khởi tạo Google");
      setLoading(false);
    }
  }, [ensureOAuthClient]);

  // ---- Flow 2A: Credential qua One Tap ----
  const promptOneTap = useCallback(() => {
    setError(null);
    try {
      ensureIdInit();
      // Hiện One Tap
      window.google.accounts.id.prompt((notification: any) => {
        // có thể debug notification để biết trạng thái hiển thị
        // console.log("One Tap prompt:", notification);
      });
    } catch (e: any) {
      setError(e?.message || "Lỗi khởi tạo One Tap");
    }
  }, [ensureIdInit]);

  const cancelOneTap = useCallback(() => {
    try {
      window.google?.accounts?.id?.cancel();
    } catch {
      // ignore
    }
  }, []);

  // ---- Flow 2B: Credential qua nút “Sign in with Google” ----
  /**
   * Vẽ nút Sign-in vào 1 container
   * @param container Element hoặc id string
   */
  const renderGoogleButton = useCallback(
    (container: HTMLElement | string, options?: GoogleButtonOptions) => {
      setError(null);
      try {
        ensureIdInit();
        const el =
          typeof container === "string"
            ? (document.getElementById(container) as HTMLElement | null)
            : container;
        if (!el) throw new Error("Không tìm thấy container để vẽ nút Google.");
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          ...options,
        });
        // Tùy, có thể auto prompt One Tap kèm theo:
        // window.google.accounts.id.prompt();
      } catch (e: any) {
        setError(e?.message || "Lỗi render Google Button");
      }
    },
    [ensureIdInit]
  );

  // ---- Reset state của hook ----
  const reset = useCallback(() => {
    setProfile(null);
    setCredential(null);
    setCredentialPayload(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // trạng thái
    ready,
    loading,
    error,

    // OAuth access_token → userinfo
    profile,
    loginGooglePreview,

    // Credential (ID token)
    credential, // JWT string
    credentialPayload, // payload đã decode
    promptOneTap,
    cancelOneTap,
    renderGoogleButton,

    // utils
    reset,
  };
}
