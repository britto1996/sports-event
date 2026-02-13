import axios from "axios";

// Default to same-origin `/api` so the browser never hits localhost:8000 directly (avoids CORS).
// In dev, Next.js rewrites `/api/*` to the backend (see `next.config.ts`).
const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").trim();

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

export type ApiErrorPayload = {
  message?: string;
  error?: string;
  detail?: string;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Request failed";
  }

  const data = error.response?.data as ApiErrorPayload | string | undefined;
  if (typeof data === "string" && data.trim()) return data;

  const message =
    (typeof data === "object" && data && (data.message || data.error || data.detail)) ||
    error.message;

  return message || "Request failed";
};
