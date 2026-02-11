const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h4 style={{ color: 'var(--foreground)', marginBottom: '2rem', fontSize: '1rem' }}>RESOURCES</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
                            <a href="#" className="hover:text-white">GIFT CARDS</a>
                            <a href="#" className="hover:text-white">FIND A VENUE</a>
                            <a href="#" className="hover:text-white">MEMBERSHIP</a>
                            <a href="#" className="hover:text-white">FEEDBACK</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--foreground)', marginBottom: '2rem', fontSize: '1rem' }}>HELP</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <a href="#" className="hover:text-white">GET HELP</a>
                            <a href="#" className="hover:text-white">ORDER STATUS</a>
                            <a href="#" className="hover:text-white">TICKETING POLICY</a>
                            <a href="#" className="hover:text-white">PAYMENT OPTIONS</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--foreground)', marginBottom: '2rem', fontSize: '1rem' }}>COMPANY</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <a href="#" className="hover:text-white">ABOUT LA CIMA</a>
                            <a href="#" className="hover:text-white">NEWS</a>
                            <a href="#" className="hover:text-white">CAREERS</a>
                            <a href="#" className="hover:text-white">INVESTORS</a>
                            <a href="#" className="hover:text-white">SUSTAINABILITY</a>
                        </div>
                    </div>
                    <div className="footer-social">
                        {/* Social Icons Placeholder */}
                        <div style={{ width: 40, height: 40, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}></div>
                        <div style={{ width: 40, height: 40, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}></div>
                        <div style={{ width: 40, height: 40, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}></div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-left">
                        <span style={{ color: 'var(--foreground)', fontWeight: '900', fontSize: '0.8rem' }}>LA CIMA PRODUCTION STUDIOS</span>
                        <span style={{ fontSize: '0.75rem' }}>&copy; 2026 LA CIMA PRODUCTION STUDIOS, INC. ALL RIGHTS RESERVED</span>
                    </div>
                    <div className="footer-bottom-right">
                        <a href="#">GUIDES</a>
                        <a href="#">TERMS OF SALE</a>
                        <a href="#">TERMS OF USE</a>
                        <a href="#">PRIVACY POLICY</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
