
"use client";

import Image from 'next/image';
import type { MatchEvent } from '@/types/mockData';

const LiveStats = ({ match }: { match: MatchEvent }) => {
    if (!match) return null;

    // Defaults if no live data
    const possession = match.possession || { home: 50, away: 50 };
    const shots = match.shots || { home: 0, away: 0 };

    return (
        <div className="live-stats">
            <div className="stats-header">
                <div className="team-stat-block">
                    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 0.5rem' }}>
                        <Image src={match.homeTeam.logo} alt={match.homeTeam.name} fill className="object-contain" style={{ objectFit: 'contain' }} />
                    </div>
                    <h3>{match.homeTeam.name}</h3>
                </div>

                <div className="score-board">
                    <div className="score">
                        {match.homeTeam.score} - {match.awayTeam.score}
                    </div>
                    <div className="match-time">{match.minute || 'FT'}</div>
                </div>

                <div className="team-stat-block">
                    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 0.5rem' }}>
                        <Image src={match.awayTeam.logo} alt={match.awayTeam.name} fill className="object-contain" style={{ objectFit: 'contain' }} />
                    </div>
                    <h3>{match.awayTeam.name}</h3>
                </div>
            </div>

            <div className="stats-bars">
                {/* Possession */}
                <div className="stat-row">
                    <div className="stat-label">
                        <span>{possession.home}%</span>
                        <span className="label-text">Possession</span>
                        <span>{possession.away}%</span>
                    </div>
                    <div className="progress-bar">
                        <div style={{ width: `${possession.home}%`, background: 'var(--primary)' }}></div>
                        <div style={{ width: `${possession.away}%`, background: 'var(--secondary)' }}></div>
                    </div>
                </div>

                {/* Shots */}
                <div className="stat-row">
                    <div className="stat-label">
                        <span>{shots.home}</span>
                        <span className="label-text">Shots</span>
                        <span>{shots.away}</span>
                    </div>
                    <div className="progress-bar">
                        <div style={{ width: `${(shots.home / (shots.home + shots.away || 1)) * 100}%`, background: 'var(--primary)' }}></div>
                        <div style={{ width: `${(shots.away / (shots.home + shots.away || 1)) * 100}%`, background: 'var(--secondary)' }}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .live-stats {
            width: 100%;
        }
        
        .stats-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
        }
        
        .team-stat-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 1;
        }
        
        .score-board {
            text-align: center;
            padding: 0 1rem;
        }
        
        .score {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1;
            white-space: nowrap;
        }
        
        .match-time {
            color: var(--muted);
            font-weight: 700;
            font-size: 1.2rem;
            margin-top: 0.5rem;
        }
        
        .stats-bars {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .stat-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .label-text {
            color: var(--muted);
            text-transform: uppercase;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .progress-bar {
            height: 10px;
            background: var(--seat-available);
            border-radius: 6px;
            overflow: hidden;
            display: flex;
        }
        
        @media (max-width: 600px) {
            .stats-header {
                flex-direction: column;
                gap: 1rem;
            }
            .score {
                font-size: 2.5rem;
            }
            h3 {
                font-size: 0.9rem;
            }
        }
      `}</style>
        </div>
    );
};

export default LiveStats;
