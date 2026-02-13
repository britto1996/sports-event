"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toastRemoved } from "@/lib/store/toastSlice";

const AUTO_DISMISS_MS = 3500;

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.toast.items);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((t) => {
      return window.setTimeout(() => {
        dispatch(toastRemoved({ id: t.id }));
      }, AUTO_DISMISS_MS);
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [dispatch, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "min(360px, calc(100vw - 32px))",
      }}
    >
      {toasts.map((t) => {
        const border = t.type === "success" ? "var(--accent)" : "var(--border-subtle)";
        return (
          <div
            key={t.id}
            className="card"
            role="status"
            style={{
              border: `1px solid ${border}`,
              background: "var(--surface-1)",
              padding: "0.9rem 1rem",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontWeight: 900,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                }}
              >
                {t.type === "success" ? "Success" : "Error"}
              </div>
              <div style={{ fontWeight: 800, color: "var(--foreground)", lineHeight: 1.35 }}>{t.message}</div>
            </div>

            <button
              type="button"
              className="icon-btn"
              aria-label="Dismiss notification"
              onClick={() => dispatch(toastRemoved({ id: t.id }))}
              style={{ height: 34, width: 34 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
