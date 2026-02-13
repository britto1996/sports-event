import { apiClient } from "@/lib/api/client";

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token?: string;
  access_token?: string;
  accessToken?: string;
  email?: string;
  user?: {
    email?: string;
  };
};

const extractToken = (data: AuthResponse | any): string | null => {
  const token =
    data?.token ??
    data?.access_token ??
    data?.accessToken ??
    data?.access ??
    data?.jwt ??
    data?.data?.token ??
    data?.data?.access_token ??
    data?.data?.access ??
    data?.data?.jwt ??
    null;

  return typeof token === "string" && token.trim() ? token : null;
};

const extractEmail = (data: AuthResponse | any, fallbackEmail: string): string => {
  const email = data?.email ?? data?.user?.email ?? data?.data?.email ?? data?.data?.user?.email;
  if (typeof email === "string" && email.trim()) return email.trim();
  return fallbackEmail.trim();
};

export const registerApi = async (input: AuthCredentials) => {
  const res = await apiClient.post<AuthResponse>("/auth/register", {
    email: input.email,
    password: input.password,
  });

  return {
    token: extractToken(res.data),
    email: extractEmail(res.data, input.email),
    raw: res.data,
  };
};

export const loginApi = async (input: AuthCredentials) => {
  const res = await apiClient.post<AuthResponse>("/auth/login", {
    email: input.email,
    password: input.password,
  });

  return {
    token: extractToken(res.data),
    email: extractEmail(res.data, input.email),
    raw: res.data,
  };
};
