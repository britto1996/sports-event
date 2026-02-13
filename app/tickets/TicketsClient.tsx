"use client";

import mockDataRaw from "@/data/mockData.json";
import MatchCard from "@/components/MatchCard";
import EventBooking from "@/components/EventBooking";
import Link from "next/link";
import type { MatchEvent, MockData } from "@/types/mockData";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fixturesRequested,
  selectFixturesItems,
  selectFixturesStatus,
} from "@/lib/store/fixturesSlice";

const mockData = mockDataRaw as MockData;

export default function TicketsClient({ eventId }: { eventId?: string }) {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectFixturesItems);
  const status = useAppSelector(selectFixturesStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fixturesRequested(undefined));
    }
  }, [dispatch, status]);

  const selectedEvent: MatchEvent | undefined = useMemo(() => {
    if (!eventId) return undefined;
    return events.find((e) => e.id === eventId);
  }, [events, eventId]);

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.status === "Upcoming"),
    [events]
  );

  if (selectedEvent) {
    return (
      <div className="container" style={{ padding: "8rem 2rem 4rem" }}>
        <Link
          href="/tickets"
          style={{
            fontSize: "0.8rem",
            color: "var(--muted)",
            marginBottom: "4rem",
            display: "inline-block",
            fontWeight: 600,
          }}
        >
          &larr; Back to Events
        </Link>

        <EventBooking event={selectedEvent} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "8rem 2rem" }}>
      <h1
        className="gradient-text"
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem, 4.5vw, 3rem)",
          marginBottom: "1rem",
          lineHeight: 1.1,
        }}
      >
        Upcoming fixtures
      </h1>
      <p
        style={{
          color: "var(--muted)",
          marginBottom: "6rem",
          maxWidth: "600px",
          margin: "0 auto 6rem",
          textAlign: "center",
          fontSize: "1.05rem",
          fontWeight: 600,
        }}
      >
        Secure your place in history. Book tickets for the {"season's"} biggest matches.
      </p>

      <div className="grid-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <MatchCard match={event} />
          </div>
        ))}
      </div>

      {status !== "loading" && upcomingEvents.length === 0 && (
        <div style={{ marginTop: "2rem", color: "var(--muted)", fontWeight: 700, textAlign: "center" }}>
          No upcoming fixtures available.
        </div>
      )}

      <section style={{ marginTop: "8rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
              fontWeight: 750,
              marginBottom: "0.75rem",
            }}
          >
            Ticket tiers
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontWeight: 600,
            }}
          >
            Choose your match-day access
          </p>
        </div>

        <div className="grid-3">
          {mockData.tickets.map((tier) => (
            <div
              key={tier.type}
              className="card"
              style={{
                padding: "2.5rem",
                border: "1px solid var(--border-subtle)",
                background: "var(--surface-0)",
              }}
            >
              <p
                style={{
                  color: "var(--accent)",
                  fontWeight: 750,
                  marginBottom: "0.75rem",
                }}
              >
                {tier.type}
              </p>
              <p style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "1.25rem" }}>
                ${tier.price}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginBottom: "1.75rem",
                }}
              >
                {tier.benefits.map((b) => (
                  <li key={b} style={{ color: "var(--muted)", fontWeight: 600, lineHeight: 1.4 }}>
                    • {b}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  color: "var(--muted)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  marginBottom: "1.5rem",
                }}
              >
                {tier.available} left
              </p>
              <Link href="/tickets" className="btn" style={{ width: "100%", fontSize: "0.85rem", padding: "1rem" }}>
                Browse Events
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
