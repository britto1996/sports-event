
import ChatAssistant from "@/components/ChatAssistant";

export default function FanZone() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                <h1 style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: '900', lineHeight: '0.85', letterSpacing: '-0.05em', marginBottom: '2rem' }}>
                    FAN<br />INTELLIGENCE
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '4px' }}>
                    POWERED BY LA CIMA NEURAL
                </p>
            </div>

            <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <ChatAssistant />
            </div>

            <div style={{ marginTop: '8rem', textAlign: 'center', color: '#444', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px' }}>
                <p>SECURE TERMINAL • ENCRYPTED SESSION • DATA PROTECTED</p>
            </div>
        </div>
    );
}
