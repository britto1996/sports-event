
import mockDataRaw from "@/data/mockData.json";
import MatchCard from "@/components/MatchCard";
import EventBooking from '@/components/EventBooking';
import Link from 'next/link';
import type { MatchEvent, MockData } from '@/types/mockData';

const mockData = mockDataRaw as MockData;

export default async function TicketsPage({
    searchParams,
}: {
    searchParams?: { t?: string } | Promise<{ t?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const t = resolvedSearchParams?.t;

    const selectedEvent: MatchEvent | undefined = t
        ? mockData.events.find((e) => e.id === t)
        : undefined;

    if (selectedEvent) {
        return (
            <div className="container" style={{ padding: '8rem 2rem 4rem' }}>
                <Link href="/tickets" style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4rem', display: 'inline-block', letterSpacing: '2px', fontWeight: 600 }}>
                    &larr; Back to Events
                </Link>

                <EventBooking event={selectedEvent} />
            </div>
        );
    }

    const upcomingEvents = mockData.events.filter((e) => e.status === 'Upcoming');

    return (
        <div className="container" style={{ padding: '8rem 2rem' }}>
            <h1 className="gradient-text" style={{ textAlign: 'center', fontSize: 'clamp(3rem, 6vw, 6rem)', marginBottom: '1rem', lineHeight: 0.9 }}>UPCOMING FIXTURES</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '6rem', maxWidth: '600px', margin: '0 auto 6rem', textAlign: 'center', fontSize: '1.2rem' }}>
                Secure your place in history. Book tickets for the {"season's"} biggest matches.
            </p>

            <div className="grid-3">
                {upcomingEvents.map((event) => (
                    <div key={event.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <MatchCard match={event} />
                    </div>
                ))}
            </div>

            <section style={{ marginTop: '8rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)', fontWeight: 900, marginBottom: '0.75rem' }}>TICKET TIERS</h2>
                    <p style={{ color: '#666', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Choose your match-day access</p>
                </div>

                <div className="grid-3">
                    {mockData.tickets.map((tier) => (
                        <div key={tier.type} className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-subtle)', background: 'var(--surface-0)' }}>
                            <p style={{ color: 'var(--accent)', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{tier.type}</p>
                            <p style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '1.25rem' }}>${tier.price}</p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                                {tier.benefits.map((b) => (
                                    <li key={b} style={{ color: 'var(--muted)', fontWeight: 600, lineHeight: 1.4 }}>• {b}</li>
                                ))}
                            </ul>
                            <p style={{ color: 'var(--muted)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '1.5rem' }}>{tier.available} left</p>
                            <Link href="/tickets" className="btn" style={{ width: '100%', fontSize: '0.85rem', padding: '1rem' }}>
                                Browse Events
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
