"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type AuthLoadingContextValue = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const AuthLoadingContext = createContext<AuthLoadingContextValue | undefined>(undefined);

export function AuthLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ loading, setLoading, withLoading }), [loading, withLoading]);

  return <AuthLoadingContext.Provider value={value}>{children}</AuthLoadingContext.Provider>;
}

export function useAuthLoading() {
  const ctx = useContext(AuthLoadingContext);
  if (!ctx) throw new Error("useAuthLoading must be used within AuthLoadingProvider");
  return ctx;
}
