"use client";

import { links } from "@/constants/path";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import EventSearchPanel from "@/components/EventSearchPanel";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutRequested } from "@/lib/store/authSlice";
import { AUTH_EMAIL_KEY } from "@/lib/authStorage";
import { selectCartItemCount } from "@/lib/store/cartSlice";

type ThemeMode = "dark" | "light";

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname() ?? links.home;
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector(selectCartItemCount);
  const isAuthed = auth.status === "authenticated" && !!auth.token;
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const emailFromStorage = useMemo(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(AUTH_EMAIL_KEY);
    return stored && stored.trim() ? stored : null;
  }, [auth.email, auth.status]);

  const displayEmail = auth.email ?? emailFromStorage;

  const getInitials = (email: string | null) => {
    const safe = (email ?? "user").trim();
    const first = safe[0] ?? "U";
    const second = safe.includes("@") ? safe.split("@")[0]?.[1] : safe[1];
    return (first + (second ?? "")).toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === links.home) return pathname === links.home;
    return pathname.startsWith(href);
  };

  useEffect(() => {
    // Initialize theme based on localStorage/system preference.
    // This intentionally does not affect the component markup, avoiding hydration mismatches.
    const initial = getInitialTheme();
    applyTheme(initial);
    window.localStorage.setItem("theme", initial);
  }, []);

  useEffect(() => {
    const shouldLock = drawerOpen || searchOpen;
    document.documentElement.classList.toggle("no-scroll", shouldLock);
    return () => {
      document.documentElement.classList.remove("no-scroll");
    };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const node = popoverRef.current;
      if (!node) return;
      if (e.target instanceof Node && !node.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [profileOpen]);

  const toggleTheme = () => {
    const current = (
      document.documentElement.dataset.theme === "light" ? "light" : "dark"
    ) as ThemeMode;
    const next: ThemeMode = current === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <button
            className="icon-btn nav-menu-btn"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 7H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <Link href={links.home} className="logo" aria-label="La Cima home">
            LACIMA<span style={{ color: "var(--accent)" }}>.</span>
          </Link>
        </div>

        <div className="nav-links" aria-label="Primary">
          <Link
            href={links.home}
            aria-current={isActive(links.home) ? "page" : undefined}
            className={isActive(links.home) ? "nav-link active-nav-link" : "nav-link"}
          >
            HOME
          </Link>
          <Link
            href={links.matchCenter}
            aria-current={isActive(links.matchCenter) ? "page" : undefined}
            className={isActive(links.matchCenter) ? "nav-link active-nav-link" : "nav-link"}
          >
            MATCH CENTER
          </Link>
          <Link
            href={links.bookings}
            aria-current={isActive(links.bookings) ? "page" : undefined}
            className={isActive(links.bookings) ? "nav-link active-nav-link" : "nav-link"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span>TICKETS</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-label={`${cartCount} tickets selected`}>
                  {cartCount}
                </span>
              )}
            </span>
          </Link>
          <Link
            href={links.fanZone}
            aria-current={isActive(links.fanZone) ? "page" : undefined}
            className={isActive(links.fanZone) ? "nav-link active-nav-link" : "nav-link"}
            style={{ display: "none" }}
            tabIndex={-1}
            aria-hidden="true"
          >
            FAN ZONE
          </Link>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Toggle color theme"
            onClick={toggleTheme}
          >
            <svg
              className="theme-icon theme-icon-moon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              className="theme-icon theme-icon-sun"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 2V4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 20V22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 12H2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M22 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4.9 4.9L6.3 6.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M17.7 17.7L19.1 19.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M19.1 4.9L17.7 6.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6.3 17.7L4.9 19.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="icon-btn search-icon-btn"
            aria-label="Search events"
            aria-expanded={searchOpen}
            onClick={() => {
              setDrawerOpen(false);
              setSearchOpen((v) => !v);
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>



          {isAuthed ? (
            <div ref={popoverRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="icon-btn"
                aria-label="Account"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid var(--border-subtle)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                {getInitials(displayEmail)}
              </button>

              {profileOpen && (
                <div
                  className="card"
                  role="dialog"
                  aria-label="Account menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 10px)",
                    width: 260,
                    padding: "1rem",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--surface-1)",
                    zIndex: 50,
                  }}
                >
                  <p style={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                    Signed in as
                  </p>
                  <p style={{ fontWeight: 900, marginBottom: "1rem", wordBreak: "break-word" }}>{displayEmail ?? ""}</p>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      dispatch(logoutRequested());
                      setProfileOpen(false);
                    }}
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn"
              style={{
                padding: "0.6rem 1.5rem",
                fontSize: "0.8rem",
                borderRadius: "20px",
              }}
            >
              LOGIN
            </Link>
          )}

          {searchOpen && (
            <>
              <div
                className="search-overlay open"
                onClick={() => setSearchOpen(false)}
                aria-hidden="true"
              />
              <EventSearchPanel
                onClose={() => {
                  setSearchOpen(false);
                }}
              />
            </>
          )}
        </div>
      </nav>

      <div
        className={`drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`drawer${drawerOpen ? " open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="drawer-header">
          <Link href="/" className="logo" onClick={() => setDrawerOpen(false)}>
            LACIMA<span style={{ color: "var(--accent)" }}>.</span>
          </Link>
          <button
            className="icon-btn"
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="drawer-links" aria-label="Mobile">
          <Link
            href={links.home}
            aria-current={isActive(links.home) ? "page" : undefined}
            className={isActive(links.home) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            HOME
          </Link>
          <Link
            href={links.matchCenter}
            aria-current={isActive(links.matchCenter) ? "page" : undefined}
            className={isActive(links.matchCenter) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            MATCH CENTER
          </Link>
          <Link
            href={links.bookings}
            aria-current={isActive(links.bookings) ? "page" : undefined}
            className={isActive(links.bookings) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span>TICKETS</span>
              {cartCount > 0 && (
                <span className="cart-badge" aria-label={`${cartCount} tickets selected`}>
                  {cartCount}
                </span>
              )}
            </span>
          </Link>
          <Link
            href={links.fanZone}
            aria-current={isActive(links.fanZone) ? "page" : undefined}
            className={isActive(links.fanZone) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
            style={{ display: "none" }}
            tabIndex={-1}
            aria-hidden="true"
          >
            FAN ZONE
          </Link>
        </nav>

        <div className="drawer-actions">
          <button
            type="button"
            className="btn"
            onClick={toggleTheme}
            style={{ width: "100%" }}
          >
            TOGGLE THEME
          </button>

          {isAuthed ? (
            <>
              <div className="profile-chip" style={{ width: "100%", justifyContent: "center" }}>
                <div className="profile-avatar" aria-hidden="true">
                  {getInitials(displayEmail)}
                </div>
                <div className="profile-name" style={{ maxWidth: "70%" }}>
                  {displayEmail ?? ""}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%" }}
                onClick={() => {
                  dispatch(logoutRequested());
                  setDrawerOpen(false);
                }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ width: "100%" }}
              onClick={() => setDrawerOpen(false)}
            >
              LOGIN
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
