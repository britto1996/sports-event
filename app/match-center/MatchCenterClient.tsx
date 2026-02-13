"use client";
import MatchCard from "@/components/MatchCard";
import LiveStats from "@/components/LiveStats";
import type { MatchEvent } from "@/types/mockData";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fixturesRequested,
  selectFixturesItems,
  selectFixturesStatus,
} from "@/lib/store/fixturesSlice";
import {
  liveMatchesRequested,
  selectLiveMatchesItems,
  selectLiveMatchesStatus,
} from "@/lib/store/liveMatchesSlice";

export default function MatchCenterClient({ matchId }: { matchId?: string }) {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectFixturesItems);
  const status = useAppSelector(selectFixturesStatus);
  const liveItems = useAppSelector(selectLiveMatchesItems);
  const liveStatus = useAppSelector(selectLiveMatchesStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fixturesRequested(undefined));
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (liveStatus === "idle") {
      dispatch(liveMatchesRequested());
    }
  }, [dispatch, liveStatus]);

  const selectedMatch: MatchEvent | undefined = useMemo(() => {
    if (matchId) {
      return liveItems.find((e) => e.id === matchId);
    }

    return liveItems[0];
  }, [events, liveItems, matchId]);

  return (
    <div className="container" style={{ padding: "8rem 2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "8rem" }}>
        <h1
          style={{
            fontSize: "clamp(4rem, 10vw, 8rem)",
            fontWeight: "900",
            lineHeight: "0.9",
            marginBottom: "1rem",
          }}
        >
          MATCH CENTER
        </h1>
        <p style={{ color: "var(--accent)", fontWeight: "800", letterSpacing: "2px" }}>
          REAL-TIME DATA ENGINE
        </p>
      </div>

      {selectedMatch ? (
        <section style={{ marginBottom: "10rem" }}>
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              padding: "4rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "4px",
                width: "100%",
                background: "var(--accent)",
              }}
            ></div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "4rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900", letterSpacing: "1px" }}>
                MATCH ANALYSIS
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    padding: "0.5rem 1rem",
                    borderRadius: "0",
                    fontWeight: "900",
                    fontSize: "0.75rem",
                  }}
                >
                  LIVE FEED
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem", fontWeight: "700" }}>
                  CONNECTED TO STADIUM NETWORKS
                </span>
              </div>
            </div>
            <LiveStats match={selectedMatch} />
          </div>
        </section>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "6rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "8rem",
          }}
        >
          <h2 style={{ color: "var(--muted)", fontSize: "2rem", fontWeight: "900" }}>
            NO LIVE FEED SELECTED
          </h2>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "4rem",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.5rem)", fontWeight: "900" }}>
          FIXTURES & RESULTS
        </h2>
        <span style={{ color: "var(--muted)", fontWeight: "700", fontSize: "0.9rem" }}>
          SEASON 2026/27
        </span>
      </div>

      <div className="grid-3">
        {events.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
