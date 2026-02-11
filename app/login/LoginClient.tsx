"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/components/AuthProvider";

type Mode = "login" | "register";

const emailSchema = Yup.string().trim().email("Enter a valid email").required("Email is required");

const loginSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

const registerSchema = Yup.object({
  name: Yup.string().trim().min(2, "Minimum 2 characters").required("Name is required"),
  email: emailSchema,
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
});

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const { status, user, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const safeNext = useMemo(() => {
    if (!next.startsWith("/")) return "/";
    return next;
  }, [next]);

  if (status === "authenticated" && user) {
    return (
      <div className="container" style={{ padding: "8rem 2rem" }}>
        <div
          className="card"
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "2.5rem",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <p
            style={{
              color: "var(--accent)",
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Logged in
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 900,
              lineHeight: 0.95,
              marginBottom: "1rem",
            }}
          >
            Welcome, {user.name}
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 700, marginBottom: "2rem" }}>{user.email}</p>
          <button className="btn" type="button" onClick={() => router.push(safeNext)} style={{ width: "100%" }}>
            CONTINUE
          </button>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              color: "var(--muted)",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "8rem 2rem" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        <div style={{ paddingTop: "0.75rem" }}>
          <p style={{ color: "var(--accent)", fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Member access
          </p>
          <h1 style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 0.85, marginBottom: "1.5rem" }}>
            SIGN IN.
            <br />
            CHECK OUT.
          </h1>
          <p style={{ color: "var(--muted)", fontWeight: 700, lineHeight: 1.6, maxWidth: 520 }}>
            Create an account to book seats online. After you log in, you can select seats and complete checkout.
          </p>
          {safeNext !== "/" && (
            <p style={{ marginTop: "1.5rem", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem" }}>
              You’ll be returned to: {safeNext}
            </p>
          )}
        </div>

        <div className="card" style={{ padding: "2.5rem", border: "1px solid var(--border-subtle)", background: "var(--surface-1)" }}>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button
              type="button"
              className={mode === "login" ? "btn" : "btn btn-secondary"}
              onClick={() => {
                setMode("login");
                setFormError(null);
                setShowPassword(false);
              }}
              style={{ flex: 1, padding: "0.9rem 1rem", fontSize: "0.85rem" }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={mode === "register" ? "btn" : "btn btn-secondary"}
              onClick={() => {
                setMode("register");
                setFormError(null);
                setShowPassword(false);
              }}
              style={{ flex: 1, padding: "0.9rem 1rem", fontSize: "0.85rem" }}
            >
              REGISTER
            </button>
          </div>

          {mode === "login" ? (
            <Formik
              key="login"
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={async (values, helpers) => {
                setFormError(null);
                try {
                  await login(values);
                  router.push(safeNext);
                } catch (err) {
                  setFormError(err instanceof Error ? err.message : "Login failed");
                } finally {
                  helpers.setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)" }}>
                      Email
                    </span>
                    <input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                      style={{ padding: "1rem", border: "1px solid var(--border-subtle)", background: "var(--surface-0)", color: "var(--foreground)", outline: "none" }}
                    />
                    {touched.email && errors.email && (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.8rem" }}>{errors.email}</span>
                    )}
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)" }}>
                      Password
                    </span>
                    <div style={{ position: "relative" }}>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        style={{ padding: "1rem 3.25rem 1rem 1rem", border: "1px solid var(--border-subtle)", background: "var(--surface-0)", color: "var(--foreground)", outline: "none", width: "100%" }}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6 0 10 7 10 7a18.4 18.4 0 0 1-4.2 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M6.2 6.2C2.9 8.7 2 12 2 12s4 7 10 7c1.1 0 2.1-.1 3-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.8rem" }}>{errors.password}</span>
                    )}
                  </label>

                  {formError && (
                    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-0)", padding: "1rem" }}>
                      <p style={{ color: "var(--foreground)", fontWeight: 800 }}>{formError}</p>
                    </div>
                  )}

                  <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "1.1rem" }}>
                    {isSubmitting ? "SIGNING IN…" : "SIGN IN"}
                  </button>

                  <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.85rem" }}>
                    No account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setShowPassword(false);
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--foreground)", fontWeight: 900, cursor: "pointer" }}
                    >
                      Register
                    </button>
                  </p>
                </form>
              )}
            </Formik>
          ) : (
            <Formik
              key="register"
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={registerSchema}
              onSubmit={async (values, helpers) => {
                setFormError(null);
                try {
                  await register(values);
                  router.push(safeNext);
                } catch (err) {
                  setFormError(err instanceof Error ? err.message : "Registration failed");
                } finally {
                  helpers.setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)" }}>
                      Full name
                    </span>
                    <input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your name"
                      autoComplete="name"
                      style={{ padding: "1rem", border: "1px solid var(--border-subtle)", background: "var(--surface-0)", color: "var(--foreground)", outline: "none" }}
                    />
                    {touched.name && errors.name && (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.8rem" }}>{errors.name}</span>
                    )}
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)" }}>
                      Email
                    </span>
                    <input
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                      style={{ padding: "1rem", border: "1px solid var(--border-subtle)", background: "var(--surface-0)", color: "var(--foreground)", outline: "none" }}
                    />
                    {touched.email && errors.email && (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.8rem" }}>{errors.email}</span>
                    )}
                  </label>

                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)" }}>
                      Password
                    </span>
                    <div style={{ position: "relative" }}>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        style={{ padding: "1rem 3.25rem 1rem 1rem", border: "1px solid var(--border-subtle)", background: "var(--surface-0)", color: "var(--foreground)", outline: "none", width: "100%" }}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6 0 10 7 10 7a18.4 18.4 0 0 1-4.2 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M6.2 6.2C2.9 8.7 2 12 2 12s4 7 10 7c1.1 0 2.1-.1 3-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "0.8rem" }}>{errors.password}</span>
                    )}
                  </label>

                  {formError && (
                    <div style={{ border: "1px solid var(--border-subtle)", background: "var(--surface-0)", padding: "1rem" }}>
                      <p style={{ color: "var(--foreground)", fontWeight: 800 }}>{formError}</p>
                    </div>
                  )}

                  <button className="btn" type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "1.1rem" }}>
                    {isSubmitting ? "CREATING…" : "CREATE ACCOUNT"}
                  </button>

                  <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "0.85rem" }}>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setShowPassword(false);
                      }}
                      style={{ background: "transparent", border: "none", color: "var(--foreground)", fontWeight: 900, cursor: "pointer" }}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </Formik>
          )}

          <p style={{ marginTop: "1.5rem", color: "var(--muted)", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", textAlign: "center" }}>
            By continuing you agree to stadium entry terms.
          </p>
        </div>
      </div>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <Link href="/" style={{ color: "var(--muted)", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem" }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
