"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import mockDataRaw from "@/data/mockData.json";
import type { MatchEvent, MockData } from "@/types/mockData";

const mockData = mockDataRaw as MockData;

type FilterValue = "__ALL__";

const normalize = (value: string) => value.trim().toLowerCase();

const toDateKey = (event: MatchEvent) => {
  const t = new Date(event.date).getTime();
  return Number.isFinite(t) ? t : 0;
};

export default function EventSearchPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [venue, setVenue] = useState<string | FilterValue>("__ALL__");
  const [game, setGame] = useState<string | FilterValue>("__ALL__");

  const venues = useMemo(() => {
    const set = new Set<string>();
    mockData.events.forEach((e) => set.add(e.venue));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const games = useMemo(() => {
    const set = new Set<string>();
    mockData.events.forEach((e) => {
      if (e.competition) set.add(e.competition);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return mockData.events
      .filter((e) => {
        if (venue !== "__ALL__" && e.venue !== venue) return false;
        if (game !== "__ALL__" && (e.competition ?? "") !== game) return false;

        if (!q) return true;

        const haystack = normalize(
          [
            e.title,
            e.venue,
            e.competition ?? "",
            e.homeTeam?.name ?? "",
            e.awayTeam?.name ?? "",
            e.status,
          ].join(" ")
        );

        return haystack.includes(q);
      })
      .sort((a, b) => toDateKey(b) - toDateKey(a));
  }, [query, venue, game]);

  return (
    <div className="search-panel" role="region" aria-label="Search events">
      <div className="container search-inner">
        <div className="search-header">
          <div>
            <p className="search-kicker">Search</p>
            <h3 className="search-title">LATEST EVENTS</h3>
          </div>
          <button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="search-controls">
          <label className="search-field">
            <span className="search-label">Search</span>
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by team, match, venue…"
              autoComplete="off"
            />
          </label>

          <label className="search-field">
            <span className="search-label">Venue</span>
            <select className="search-select" value={venue} onChange={(e) => setVenue(e.target.value)}>
              <option value="__ALL__">All venues</option>
              {venues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="search-field">
            <span className="search-label">Game</span>
            <select className="search-select" value={game} onChange={(e) => setGame(e.target.value)}>
              <option value="__ALL__">All games</option>
              {games.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="search-results" aria-label="Event list">
          {filtered.length === 0 ? (
            <div className="search-empty">No events found.</div>
          ) : (
            filtered.map((e) => {
              const href = e.status === "Upcoming" ? `/tickets?t=${e.id}` : `/match-center?m=${e.id}`;
              return (
                <Link
                  key={e.id}
                  href={href}
                  className="search-item"
                  onClick={onClose}
                >
                  <div className="search-item-main">
                    <div className="search-item-top">
                      <span className="search-pill">{e.competition ?? "Match"}</span>
                      <span className="search-meta">{e.status.toUpperCase()}</span>
                    </div>
                    <div className="search-item-title">{e.title}</div>
                    <div className="search-item-sub">{e.venue}</div>
                  </div>
                  <div className="search-item-cta">
                    {e.status === "Upcoming" ? "GET TICKETS" : "VIEW"}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
