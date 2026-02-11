"use client";

import mockDataRaw from "@/data/mockData.json";
import MatchCard from "@/components/MatchCard";
import Link from 'next/link';
import type { MockData } from '@/types/mockData';
import { links } from "@/constants/path";

const mockData = mockDataRaw as MockData;

export default function Home() {
  const featuredMatches = mockData.events.slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero Section - Immersive Nike Style */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="animate-fade-in" style={{
            fontSize: 'clamp(4rem, 15vw, 12rem)',
            fontWeight: '900',
            lineHeight: '0.85',
            letterSpacing: '-0.05em',
            marginBottom: '3rem'
          }}>
            REDEFINE<br />THE GAME
          </h1>
          <p className="animate-fade-in" style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--muted)',
            marginBottom: '4rem',
            maxWidth: '600px',
            margin: '0 auto 4rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Experience sports production at its peak. Official platforms for the {"world's"} greatest events.
          </p>
          <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href={links.tickets} className="btn">
              GET TICKETS
            </Link>
            <Link href={links.matchCenter} className="btn btn-secondary">
              MATCH CENTER
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Matches - Clean Nike Grid */}
      <section style={{ padding: '8rem 0', background: 'var(--background)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <div>
              <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px' }}>LIVE & UPCOMING</h2>
              <p style={{ color: 'var(--muted)', fontWeight: '700', marginTop: '0.5rem' }}>{"THE WORLD'S STAGE IS SET"}</p>
            </div>
            <Link href={links.matchCenter} style={{
              fontWeight: '800',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              borderBottom: '2px solid var(--accent)',
              paddingBottom: '4px'
            }}>
              VIEW ALL FIXTURES
            </Link>
          </div>
          <div className="grid-3">
            {featuredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Promo Section - Split Layout */}
      <section style={{ background: 'var(--surface-2)', padding: '10rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                height: '600px',
                background: 'var(--card-bg)',
                borderRadius: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚡</div>
                  <p style={{ fontWeight: '900', letterSpacing: '2px', color: 'var(--muted)' }}>AI INTERFACE v.2.0</p>
                </div>
              </div>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                background: 'var(--accent)',
                color: '#000',
                padding: '1rem 2rem',
                fontWeight: '900',
                fontSize: '0.8rem',
                letterSpacing: '1px'
              }}>
                NEURAL ENGINE
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '4.5rem', marginBottom: '2rem', lineHeight: '0.9' }}>NEXT-GEN ENGAGEMENT</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '3rem', fontSize: '1.2rem', fontWeight: '500', lineHeight: '1.6' }}>
                Personalized match-day assistants powered by advanced AI. Real-time stats, instant ticketing assistance, and custom fan alerts.
              </p>
              <Link href="/fan-zone" className="btn" style={{ padding: '1.25rem 3rem' }}>
                ENTER FAN ZONE
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
