import axios from "axios";

// Default to same-origin `/api` so the browser never hits localhost:8000 directly (avoids CORS).
// In dev, Next.js rewrites `/api/*` to the backend (see `next.config.ts`).
const baseURL = "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("sportsEvent.auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      try {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to get the authirization token", e);
      }
    }
  }
  return config;
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

  const data = error.response?.data as any;

  // Handle string responses
  if (typeof data === "string" && data.trim()) return data;

  // Handle backend error structure: { error: { code, message } }
  if (typeof data === "object" && data) {
    // Try nested error.message
    if (data.error && typeof data.error === "object" && data.error.message) {
      return String(data.error.message);
    }

    // Try direct message, error, or detail fields
    const message = data.message || data.error || data.detail;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return error.message || "Request failed";
};
