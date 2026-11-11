"use client";

import { createContext, useContext } from "react";

export type UserRole = "ADMIN" | "VIEWER";

const AuthContext = createContext<{ username: string; role: UserRole } | null>(null);

export function AuthProvider({
  children,
  username,
  role,
}: {
  children: React.ReactNode;
  username: string;
  role: UserRole;
}) {
  return <AuthContext.Provider value={{ username, role }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
