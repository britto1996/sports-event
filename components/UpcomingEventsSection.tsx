"use client";

import { useEffect, useState } from "react";
import UpcomingEventsSlider from "@/components/UpcomingEventsSlider";
import type { MatchEvent } from "@/types/mockData";
import { syncEvents } from "@/lib/api/events";

export default function UpcomingEventsSection() {
    const [events, setEvents] = useState<MatchEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                console.log('[UpcomingEventsSection] Fetching events...');
                const allEvents = await syncEvents();
                console.log('[UpcomingEventsSection] Fetched events:', allEvents.length);

                // Filter for upcoming events only and sort by date (nearest first)
                const upcomingEvents = allEvents
                    .filter(event => event.status === "Upcoming")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                console.log('[UpcomingEventsSection] Upcoming events:', upcomingEvents.length);
                setEvents(upcomingEvents);
            } catch (e) {
                console.error('[UpcomingEventsSection] Error:', e);

                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Failed to load events. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    return (
        <section style={{ padding: '8rem 0', background: 'var(--background)' }}>
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 750, letterSpacing: '-0.01em' }}>Upcoming Events</h2>
                    <p style={{ color: 'var(--muted)', fontWeight: 600, marginTop: '0.35rem' }}>Book your tickets for the most anticipated matches</p>
                </div>

                {loading ? (
                    <div style={{ marginTop: "2rem", color: "var(--muted)", fontWeight: 700, textAlign: 'center' }}>
                        Loading upcoming events...
                    </div>
                ) : error ? (
                    <div style={{ marginTop: "2rem", color: "var(--accent)", fontWeight: 700 }}>
                        {error}
                    </div>
                ) : (
                    <UpcomingEventsSlider events={events} />
                )}
            </div>
        </section>
    );
}
