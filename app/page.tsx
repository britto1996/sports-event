import Link from 'next/link';
import { links } from "@/constants/path";
import { syncEvents, fetchEvents } from "@/lib/api/events";
import { enrichEventsWithFixtures } from "@/lib/api/enrichEvents";
import MatchCard from "@/components/MatchCard";
import type { MatchEvent } from "@/types/mockData";

export default async function Home() {
  // Fetch events from server
  let events: MatchEvent[] = [];
  let error: string | null = null;

  try {
    // Step 1: Sync events from external source
    await syncEvents();

    // Step 2: Fetch events with limit=3 for homepage
    const allEvents = await fetchEvents(3);

    // Filter for upcoming events only and sort by date (nearest first)
    events = allEvents
      .filter(event => event.status === "Upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load events";
  }

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
            <Link href={links.matchCenter} className="btn">
              GET TICKETS
            </Link>
            <Link href={links.matchCenter} className="btn btn-secondary">
              MATCH CENTER
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section style={{ padding: '8rem 0', background: 'var(--background)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 750, letterSpacing: '-0.01em' }}>Upcoming Events</h2>
              <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: '0.35rem' }}>Book your tickets for the most anticipated matches</p>
            </div>

            <Link
              href={links.matchCenter}
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--accent)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s',
              }}
              className="view-all-link"
            >
              VIEW ALL
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </Link>
          </div>

          {error ? (
            <div style={{ marginTop: "2rem", color: "var(--accent)", fontWeight: 700 }}>
              {error}
            </div>
          ) : events.length > 0 ? (
            <div className="grid-3" style={{ gap: '2rem' }}>
              {events.map((event) => (
                <MatchCard key={event.id} match={event} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontWeight: 600 }}>
              No upcoming events available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

