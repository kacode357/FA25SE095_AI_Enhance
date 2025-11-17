// lib/turnstile.ts

declare global {
  interface Window {
    turnstile?: any;
  }
}

export const SCRIPT_ID = "cf-turnstile";
export const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function loadTurnstileScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById(SCRIPT_ID)) return;

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src = SCRIPT_SRC;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

/**
 * Render an invisible Turnstile widget into the provided container.
 * Returns widget id number or null on failure.
 */
export function renderTurnstileWidget(container: HTMLElement, siteKey: string, callback?: (token: string) => void): number | null {
  try {
    if (!window.turnstile || typeof window.turnstile.render !== "function") return null;
    const id = window.turnstile.render(container, {
      sitekey: siteKey,
      size: "invisible",
      callback: callback,
    });
    return id;
  } catch (e) {
    return null;
  }
}

/**
 * Execute a previously rendered widget and resolve with token or null on timeout/error.
 */
export async function executeTurnstile(widgetId: number | null, container: HTMLElement | null, timeoutMs = 8000): Promise<string | null> {
  if (!widgetId || typeof window === "undefined" || !window.turnstile) return null;
  if (!container) return null;

  return await new Promise<string | null>((resolve) => {
    // clear previous token
    if (container) delete container.dataset.token;

    const timeout = setTimeout(() => resolve(null), timeoutMs);

    try {
      window.turnstile.execute(widgetId);
    } catch (e) {
      clearTimeout(timeout);
      resolve(null);
      return;
    }

    const check = () => {
      const token = container.dataset.token;
      if (token) {
        clearTimeout(timeout);
        resolve(token);
      } else {
        setTimeout(check, 200);
      }
    };

    check();
  });
}
