import { Suspense } from "react";
import LoginClient from "./LoginClient";

const Fallback = () => {
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
            color: "var(--muted)",
            fontWeight: 900,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Loading…
        </p>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <LoginClient />
    </Suspense>
  );
}
