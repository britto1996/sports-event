
export default function FanZone() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
                    Chat Assistant
                </h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--muted)', fontWeight: '650', maxWidth: '720px', margin: '0 auto' }}>
                    The assistant is now available on every page as a fixed widget in the bottom-right corner.
                </p>
            </div>
        </div>
    );
}
