import QRCode from 'qrcode';

export interface BookingQRData {
    bookingId: string;
    eventId: string;
    seats: string[]; // Array of seat IDs
    timestamp: string;
    verification: string; // Simple hash for verification
}

/**
 * Generate a unique booking reference number
 * Format: LCM-YYYY-XXXXX
 */
export function generateBookingReference(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    return `LCM-${year}-${random}`;
}

/**
 * Create a simple verification hash from booking data
 */
function createVerificationHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

/**
 * Generate a QR code as a base64 data URL
 */
export async function generateBookingQRCode(
    bookingId: string,
    eventId: string,
    seatIds: string[],
    timestamp: string
): Promise<string> {
    const dataString = `${bookingId}:${eventId}:${seatIds.join(',')}:${timestamp}`;
    const verification = createVerificationHash(dataString);

    const qrData: BookingQRData = {
        bookingId,
        eventId,
        seats: seatIds,
        timestamp,
        verification,
    };

    try {
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });

        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        // Return a fallback empty QR code or throw
        throw new Error('Failed to generate QR code');
    }
}
