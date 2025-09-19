"use client";

import { storage } from "@/lib/storage";
import { User } from "@/lib/types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const cached = storage.get<User | null>("ae:user", null);
    setUser(cached);
  }, []);

  const login = async (email: string, _password: string) => {
    // Fake: any email ending with @staff.edu considered staff; otherwise student
    const role = email.endsWith("@staff.edu") ? "staff" : "student";
    const logged: User = { id: "u1", name: role === "staff" ? "Staff User" : "Student User", role, email };
    storage.set("ae:user", logged);
    setUser(logged);
  };

  const logout = () => {
    storage.set("ae:user", null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
