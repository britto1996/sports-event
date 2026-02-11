"use client";

import { links } from "@/constants/path";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import EventSearchPanel from "@/components/EventSearchPanel";

type ThemeMode = "dark" | "light";

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = mode;
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname() ?? links.home;
  const { status, user, logout } = useAuth();
  const isAuthed = status === "authenticated" && !!user;

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + second).toUpperCase();
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
            href={links.tickets}
            aria-current={isActive(links.tickets) ? "page" : undefined}
            className={isActive(links.tickets) ? "nav-link active-nav-link" : "nav-link"}
          >
            TICKETS
          </Link>
          <Link
            href={links.fanZone}
            aria-current={isActive(links.fanZone) ? "page" : undefined}
            className={isActive(links.fanZone) ? "nav-link active-nav-link" : "nav-link"}
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

          <button
            type="button"
            className="nav-link nav-text-btn"
            aria-label="Search events"
            aria-expanded={searchOpen}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: "900",
              letterSpacing: "1px",
            }}
            onClick={() => {
              setDrawerOpen(false);
              setSearchOpen((v) => !v);
            }}
          >
            SEARCH
          </button>

          {isAuthed && user ? (
            <div className="profile-chip" aria-label={`Logged in as ${user.name}`}>
              <div className="profile-avatar" aria-hidden="true">
                {getInitials(user.name)}
              </div>
              <div className="profile-name">{user.name}</div>
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
        </div>
      </nav>

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
            href={links.tickets}
            aria-current={isActive(links.tickets) ? "page" : undefined}
            className={isActive(links.tickets) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            TICKETS
          </Link>
          <Link
            href={links.fanZone}
            aria-current={isActive(links.fanZone) ? "page" : undefined}
            className={isActive(links.fanZone) ? "drawer-link drawer-link-active" : "drawer-link"}
            onClick={() => {
              setDrawerOpen(false);
            }}
          >
            FAN ZONE
          </Link>
          <Link
            href={"#"}
            className="drawer-link"
            onClick={(e) => {
              e.preventDefault();
              setDrawerOpen(false);
              setSearchOpen(true);
            }}
          >
            SEARCH
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

          {isAuthed && user ? (
            <>
              <div className="profile-chip" style={{ width: "100%", justifyContent: "center" }}>
                <div className="profile-avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </div>
                <div className="profile-name" style={{ maxWidth: "70%" }}>
                  {user.name}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%" }}
                onClick={() => {
                  logout();
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
