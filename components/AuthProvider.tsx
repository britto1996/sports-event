"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PublicUser } from "@/lib/auth";
import { getCurrentUser, loginUser, logoutUser, registerUser, setCurrentUser } from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: PublicUser | null;
  login: (input: { email: string; password: string }) => Promise<PublicUser>;
  register: (input: { name: string; email: string; password: string }) => Promise<PublicUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    // Defer state updates to avoid sync setState-in-effect lint rule.
    queueMicrotask(() => {
      setUser(current);
      setStatus(current ? "authenticated" : "anonymous");
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      user,
      login: async (input) => {
        const loggedIn = loginUser(input);
        setCurrentUser(loggedIn);
        setUser(loggedIn);
        setStatus("authenticated");
        return loggedIn;
      },
      register: async (input) => {
        const created = registerUser(input);
        setCurrentUser(created);
        setUser(created);
        setStatus("authenticated");
        return created;
      },
      logout: () => {
        logoutUser();
        setUser(null);
        setStatus("anonymous");
      },
    };
  }, [status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return ctx;
};
