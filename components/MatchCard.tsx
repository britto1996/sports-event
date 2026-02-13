"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const Venue3DView = dynamic(() => import('./Venue3DView'), { ssr: false });

interface Team {
    name: string;
    logo: string;
    score?: number;
}

interface MatchProps {
    id: string;
    title: string;
    date: string;
    venue: string;
    status: string;
    competition?: string;
    homeTeam: Team;
    awayTeam: Team;
    ticketsAvailable?: boolean;
    score?: { home: number; away: number };
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    minute?: string;
}

const MatchCard = ({ match }: { match: MatchProps }) => {
    const isLive = match.status === 'Live';
    const isUpcoming = match.status === 'Upcoming';
    const [showVenue, setShowVenue] = useState(false);

    // Format date consistently to avoid hydration mismatch
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC'
            }).toUpperCase();
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="card match-card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', borderColor: 'var(--border-subtle)' }}>
            <div className="match-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: isLive ? 'var(--accent)' : '#666' }}>
                    {isLive ? <span className="live-badge">LIVE • {match.minute}</span> : (match.competition || 'MATCH DAY')}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888' }}>{formatDate(match.date)}</span>
            </div>

            <div className="teams-vs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flex: 1 }}>
                <div className="team" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', padding: '10px', background: 'transparent' }}>
                        {match.homeTeam.logo ? (
                            <Image
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.name}
                                fill
                                sizes="80px"
                                style={{ objectFit: 'contain' }}
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: 'var(--surface-1)',
                                    color: 'var(--foreground)',
                                    fontWeight: 900,
                                }}
                            >
                                {(match.homeTeam.name?.[0] ?? 'H').toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', textAlign: 'center', lineHeight: 1.1 }}>{match.homeTeam.name}</span>
                    {(isLive || match.status === 'Finished') && (
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem', color: isLive ? 'var(--accent)' : 'var(--accent)' }}>
                            {match.homeTeam.score}
                        </span>
                    )}
                </div>

                <div className="vs-badge" style={{ fontSize: '1rem', fontWeight: 900, color: '#333', opacity: 0.5, letterSpacing: '-1px' }}>VS</div>

                <div className="team" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', padding: '10px', background: 'transparent' }}>
                        {match.awayTeam.logo ? (
                            <Image
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.name}
                                fill
                                sizes="80px"
                                style={{ objectFit: 'contain' }}
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: 'var(--surface-1)',
                                    color: 'var(--foreground)',
                                    fontWeight: 900,
                                }}
                            >
                                {(match.awayTeam.name?.[0] ?? 'A').toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', textAlign: 'center', lineHeight: 1.1 }}>{match.awayTeam.name}</span>
                    {(isLive || match.status === 'Finished') && (
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem', color: isLive ? 'var(--accent)' : 'var(--accent)' }}>
                            {match.awayTeam.score}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>{match.venue}</p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {isUpcoming && (
                        <Link href={`/tickets?t=${match.id}`} className="btn" style={{ width: '100%', fontSize: '0.8rem', padding: '1rem' }}>
                            GET TICKETS
                        </Link>
                    )}
                    {(isLive || match.status === 'Finished') && (
                        <Link href={`/match-center?m=${match.id}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '1rem' }}>
                            MATCH CENTER
                        </Link>
                    )}
                </div>

                <button
                    onClick={() => setShowVenue(true)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}
                >
                    VIEW VENUE 3D
                </button>
            </div>

            {showVenue && (
                <Venue3DView venueName={match.venue} onClose={() => setShowVenue(false)} />
            )}

            <style jsx>{`
        .live-badge {
            background: var(--accent);
            color: black;
            padding: 4px 8px;
            font-weight: 800;
            border-radius: 2px;
            font-size: 0.7rem;
        }
      `}</style>
        </div>
    );
};

export default MatchCard;
