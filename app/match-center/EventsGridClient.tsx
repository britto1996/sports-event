"use client";

import { useEffect, useState } from "react";
import { syncEvents, fetchEvents } from "@/lib/api/events";
import { enrichEventsWithFixtures } from "@/lib/api/enrichEvents";
import MatchCard from "@/components/MatchCard";
import type { MatchEvent } from "@/types/mockData";

export default function EventsGridClient() {
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);

    const fetchEventsData = async (currentLimit: number) => {
        try {
            setLoading(true);
            setError(null);

            // Step 1: Sync events
            await syncEvents();

            // Step 2: Fetch with limit
            const allEvents = await fetchEvents(currentLimit);

            // Step 3: Enrich events with fixture data (team names and logos)
            const enrichedEvents = await enrichEventsWithFixtures(allEvents);

            // Filter for upcoming events
            const upcomingEvents = enrichedEvents
                .filter(event => event.status === "Upcoming")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setEvents(upcomingEvents);

            // Fetch total count (without limit)
            if (totalCount === 0) {
                const allEventsForCount = await fetchEvents();
                const enrichedForCount = await enrichEventsWithFixtures(allEventsForCount);
                setTotalCount(enrichedForCount.filter(e => e.status === "Upcoming").length);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventsData(limit);
    }, [limit]);

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
    };

    return (
        <div style={{ padding: '4rem 0', background: 'var(--background)', minHeight: '100vh' }}>
            <div className="container">
                {/* Header with total count and limit selector */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginTop: "80px"
                }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            All Upcoming Events
                        </h1>
                        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>
                            {loading ? 'Loading...' : `Showing ${events.length} of ${totalCount} upcoming events`}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontWeight: 600, color: 'var(--muted)' }}>Show:</label>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="limit-selector"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                border: '2px solid var(--border)',
                                borderRadius: '8px',
                                background: 'var(--card-bg)',
                                color: 'var(--foreground)',
                                cursor: 'pointer',
                                minWidth: '120px',
                            }}
                        >
                            <option value={10}>10 events</option>
                            <option value={25}>25 events</option>
                            <option value={50}>50 events</option>
                            <option value={100}>100 events</option>
                            <option value={999999}>All events</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: 'var(--muted)',
                        fontSize: '1.2rem',
                        fontWeight: 600
                    }}>
                        Loading events...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        padding: '2rem',
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '2px solid var(--accent)',
                        borderRadius: '12px',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Events Grid */}
                {!loading && !error && events.length > 0 && (
                    <div className="events-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem',
                    }}>
                        {events.map((event) => (
                            <MatchCard key={event.id} match={event} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && events.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem',
                        color: 'var(--muted)',
                        fontSize: '1.2rem',
                        fontWeight: 600
                    }}>
                        No upcoming events found.
                    </div>
                )}
            </div>
        </div>
    );
}
