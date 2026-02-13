"use client";

import MatchCard from "@/components/MatchCard";
import Link from 'next/link';
import { links } from "@/constants/path";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fixturesRequested,
  selectFixturesItems,
  selectFixturesStatus,
} from "@/lib/store/fixturesSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectFixturesItems);
  const status = useAppSelector(selectFixturesStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fixturesRequested(undefined));
    }
  }, [dispatch, status]);

  const featuredMatches = useMemo(() => items.slice(0, 3), [items]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: "1024px", textAlign: 'center', marginTop: "80px" }}>
          <h1 className="animate-fade-in" style={{
            fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: '1.05',
            marginBottom: '1.5rem',
          }}>
            Experiance the thrill of live sports like never before
          </h1>
          <p className="animate-fade-in" style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--muted)',
            maxWidth: '600px',
            marginTop: 0,
            marginRight: 'auto',
            marginBottom: '2.5rem',
            marginLeft: 'auto',
            letterSpacing: '0'
          }}>
            Experience sports production at its peak. Official platforms for the {"world's"} greatest events.
          </p>
          <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Link href={links.tickets} className="btn">
              GET TICKETS
            </Link>
            <Link href={links.matchCenter} className="btn btn-secondary">
              MATCH CENTER
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section style={{ padding: '8rem 0', background: 'var(--background)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 750, letterSpacing: '-0.01em' }}>Live & upcoming</h2>
              <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: '0.35rem' }}>{"The world's stage is set"}</p>
            </div>
            <Link href={links.matchCenter} style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              borderBottom: '2px solid var(--accent)',
              paddingBottom: '4px'
            }}>
              View all fixtures
            </Link>
          </div>
          <div className="grid-3">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {status !== "loading" && featuredMatches.length === 0 && (
            <div style={{ marginTop: "2rem", color: "var(--muted)", fontWeight: 700 }}>
              No fixtures available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
