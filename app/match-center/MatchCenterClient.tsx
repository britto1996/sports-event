"use client";
import MatchCard from "@/components/MatchCard";
import LiveMatch3DView from "@/components/three/LiveMatch3DView";
import Fixtures3DView from "@/components/three/Fixtures3DView";
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
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Match center
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 650 }}>
          Real‑time live match feed
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
              <h2 style={{ fontSize: "1.25rem", fontWeight: 750, letterSpacing: "-0.01em" }}>
                Match analysis
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: 999,
                    fontWeight: 750,
                    fontSize: "0.75rem",
                  }}
                >
                  Live
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem", fontWeight: 600 }}>
                  Updated in real time
                </span>
              </div>
            </div>
            <LiveMatch3DView match={selectedMatch} />
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
        <h2 style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 750 }}>
          Fixtures & results
        </h2>
        <span style={{ color: "var(--muted)", fontWeight: "700", fontSize: "0.9rem" }}>
          SEASON 2026/27
        </span>
      </div>

      <Fixtures3DView events={events} />

      {/* Keep the cards as a fallback for quick scanning */}
      <div style={{ marginTop: "4rem" }}>
        <div className="grid-3">
          {events.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
