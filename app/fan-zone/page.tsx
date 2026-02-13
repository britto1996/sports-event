import Player3DView from "@/components/Player3DView";

export default function FanZone() {
    return (
        <div style={{ paddingBottom: '4rem', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Hero Section */}
            <div className="hero" style={{ padding: '8rem 1rem 4rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{
                        color: 'var(--accent)',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        Immersive Experience
                    </p>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 7vw, 5rem)',
                        fontWeight: '900',
                        lineHeight: '1.05',
                        letterSpacing: '-0.03em',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, var(--foreground), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Fan Zone 3D
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--muted)',
                        fontWeight: '500',
                        maxWidth: '680px',
                        margin: '0 auto 4rem',
                        lineHeight: '1.6'
                    }}>
                        Explore the team in a stunning 3D environment. Analyze player stats, styles, and strengths like never before.
                    </p>
                </div>
            </div>

            {/* 3D View Container */}
            <div className="container">
                <div style={{
                    boxShadow: 'var(--shadow-2)',
                    borderRadius: '24px',
                    padding: '4px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <Player3DView />
                </div>
            </div>

            {/* Additional Stats Section (Optional placeholder for now) */}
            <div className="container" style={{ marginTop: '6rem' }}>
                <div className="grid-3">
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Live Match Stats</h3>
                        <p style={{ color: 'var(--muted)' }}>Real-time performance metrics updating every second.</p>
                    </div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Player Comparisons</h3>
                        <p style={{ color: 'var(--muted)' }}>Compare your favorite players head-to-head.</p>
                    </div>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Fantasy Points</h3>
                        <p style={{ color: 'var(--muted)' }}>Track your fantasy league standings here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
