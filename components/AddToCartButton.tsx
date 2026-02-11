'use client';

export default function AddToCartButton() {
    return (
        <button
            className="btn"
            onClick={() => {
                // Simulate a checkout process or modal
                const confirm = window.confirm('Ticket selected! Proceed to simulated payment?');
                if (confirm) {
                    alert('Payment Successful! Your QR Code has been generated.');
                }
            }}
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', width: '100%' }}>
            Select Ticket
        </button>
    );
}
