"use client";
import React from 'react';

interface VenueStatProps {
    label: string;
    value: string;
    color: string;
    icon?: string;
}

export default function VenueStatsDisplay({ venueName }: { venueName: string }) {
    const stats: VenueStatProps[] = [
        { label: "Capacity", value: "75,024", color: "from-blue-400 to-blue-600", icon: "👥" },
        { label: "Surface", value: "Hybrid Grass", color: "from-green-400 to-green-600", icon: "🌱" },
        { label: "Dimensions", value: "105m x 68m", color: "from-purple-400 to-purple-600", icon: "📏" },
        { label: "Weather", value: "18°C Sunny", color: "from-orange-400 to-orange-600", icon: "🌤️" },
    ];

    return (
        <div style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Venue Insights</h3>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{venueName}</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem'
            }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{
                        position: 'relative',
                        background: 'var(--surface-1)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {/* Gradient Background Glow */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-20%',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, var(--accent), transparent)`,
                            opacity: 0.15,
                            filter: 'blur(40px)'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.label}
                                </span>
                                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                            </div>
                            <div style={{
                                fontSize: '1.8rem',
                                fontWeight: 900,
                                letterSpacing: '-1px',
                                background: `linear-gradient(to right, var(--foreground), var(--muted))`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {stat.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
