"use client";

import { useState } from 'react';
import SeatMap, { type SeatCategory, type SeatSelection } from './SeatMap';
import mockDataRaw from '@/data/mockData.json';
import type { MatchEvent, MockData, TicketTier } from '@/types/mockData';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { cartEventSeatsSet, cartEventCleared } from '@/lib/store/cartSlice';
import { bookingAdded, selectBookedSeatIds } from '@/lib/store/bookingsSlice';
import { toastAdded } from '@/lib/store/toastSlice';
import { links } from '@/constants/path';
import { generateBookingReference, generateBookingQRCode } from '@/lib/qrCodeUtils';
import { createCheckout } from '@/lib/api/tickets';
import type { CheckoutResponse } from '@/lib/api/tickets';

const mockData = mockDataRaw as MockData;

interface EventBookingProps {
    event: MatchEvent;
}

export default function EventBooking({ event }: EventBookingProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((s) => s.auth);
    const isAuthed = auth.status === 'authenticated' && !!auth.token;
    const [isProcessing, setIsProcessing] = useState(false);

    const tiers = mockData.tickets;
    const defaultTier = tiers.find((t) => t.type === 'Standard') ?? tiers[0];

    const [selectedTier, setSelectedTier] = useState<TicketTier>(defaultTier);
    const [selectedSeats, setSelectedSeats] = useState<SeatSelection[]>([]);

    // Get already booked seats for this event
    const bookedSeatIds = useAppSelector(selectBookedSeatIds(event.id));

    const handleSelectionChange = (seats: SeatSelection[]) => {
        setSelectedSeats(seats);
        dispatch(
            cartEventSeatsSet({
                eventId: event.id,
                eventTitle: event.title,
                tierType: selectedTier.type,
                seats,
            })
        );
    };

    const redirectToLogin = () => {
        const next = typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/tickets';
        router.push(`/login?next=${encodeURIComponent(next)}`);
    };

    const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

    const isPremium = selectedTier.type === 'Premium';
    const isVipBox = selectedTier.type === 'VIP Box';

    const seatMapKey = `${event.id}:${selectedTier.type}`;

    const allowedCategories: SeatCategory[] = isVipBox ? ['VIP'] : ['Standard'];
    const priceByCategory = {
        Standard: selectedTier.price,
        VIP: selectedTier.price,
    };
    const labelByCategory = {
        Standard: isPremium ? 'Premium' : 'Standard',
        VIP: isVipBox ? 'VIP Box' : 'VIP',
    };

    return (
        <div className="booking-container">
            <div style={{ marginBottom: '3rem' }}>
                <p style={{ color: '#666', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Ticketing</p>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 0.9, marginBottom: '0.75rem' }}>{event.title}</h1>
                <p style={{ color: '#888', fontWeight: 700 }}>{event.venue} • {new Date(event.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })}</p>
            </div>

            <div className="booking-grid">
                <div className="seat-map-section">
                    <h2 style={{
                        marginBottom: '2rem',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        Choose your venue section
                    </h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                        {tiers.map((tier) => {
                            const active = tier.type === selectedTier.type;
                            return (
                                <button
                                    key={tier.type}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTier(tier);
                                        setSelectedSeats([]);
                                        dispatch(
                                            cartEventSeatsSet({
                                                eventId: event.id,
                                                eventTitle: event.title,
                                                tierType: tier.type,
                                                seats: [],
                                            })
                                        );
                                    }}
                                    className="btn btn-secondary"
                                    style={{
                                        borderRadius: 30,
                                        borderColor: active ? 'var(--accent)' : 'var(--border-subtle)',
                                        color: active ? 'var(--foreground)' : 'var(--muted)',
                                        padding: '0.85rem 1.25rem',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: '0.25rem',
                                        minWidth: 180,
                                        background: active ? 'rgba(212, 255, 0, 0.08)' : 'transparent',
                                    }}
                                >
                                    <span style={{ fontWeight: 900, letterSpacing: '1px' }}>{tier.type.toUpperCase()}</span>
                                    <span style={{ fontWeight: 800, color: 'var(--accent)' }}>${tier.price}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)', background: 'var(--card-bg)', marginBottom: '2rem' }}>
                        <p style={{ fontWeight: 900, letterSpacing: '1px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Included with {selectedTier.type}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--muted)', fontWeight: 600 }}>
                            {selectedTier.benefits.map((b) => (
                                <span key={b}>• {b}</span>
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Seats available depend on section
                        </p>
                    </div>

                    <h2 style={{
                        marginBottom: '2rem',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                    }}>
                        Select your seats
                    </h2>

                    <SeatMap
                        key={seatMapKey}
                        onSelectionChange={handleSelectionChange}
                        allowedCategories={allowedCategories}
                        priceByCategory={priceByCategory}
                        labelByCategory={labelByCategory}
                        requireAuth={!isAuthed}
                        onRequireAuth={redirectToLogin}
                        bookedSeatIds={bookedSeatIds}
                    />
                </div>

                <div className="summary-wrapper">
                    <div className="card summary-card" style={{
                        padding: '2.5rem',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0',
                        background: 'var(--background)'
                    }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            marginBottom: '2rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #1a1a1a',
                            letterSpacing: '-0.5px'
                        }}>
                            YOUR SELECTION
                        </h3>

                        <div className="selected-seats-list" style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            marginBottom: '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}>
                            {selectedSeats.length === 0 ? (
                                <p style={{ color: '#444', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0', fontWeight: '500' }}>
                                    NO SEATS SELECTED
                                </p>
                            ) : (
                                selectedSeats.map(seat => (
                                    <div key={seat.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.9rem',
                                        fontWeight: '700',
                                        color: 'var(--foreground)',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '1rem' }}>ROW {seat.row}, SEAT {seat.number}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '1px' }}>{seat.typeLabel.toUpperCase()} TICKET</span>
                                        </div>
                                        <span style={{ fontSize: '1.1rem' }}>${seat.price}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid #1a1a1a'
                        }}>
                            <span style={{ fontWeight: '900', fontSize: '1rem', color: '#666' }}>TOTAL</span>
                            <span style={{ color: '#fff', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>${totalPrice}</span>
                        </div>

                        <button
                            className="btn"
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                fontSize: '1rem',
                                borderRadius: '30px',
                                background: selectedSeats.length > 0 && isAuthed ? 'var(--primary)' : 'transparent',
                                color: selectedSeats.length > 0 && isAuthed ? 'var(--primary-inv)' : 'var(--muted)',
                                border: `1px solid ${selectedSeats.length > 0 && isAuthed ? 'transparent' : 'var(--border-subtle)'}`,
                            }}
                            disabled={selectedSeats.length === 0 || !isAuthed || isProcessing}
                            onClick={async () => {
                                if (!isAuthed) {
                                    redirectToLogin();
                                    return;
                                }

                                setIsProcessing(true);

                                try {
                                    // 1. Create Checkout / Booking via API
                                    // We process seats one by one or batch if API supported it. 
                                    // The prompt implies a single payload: { eventId, seatNo, amount }
                                    // But we allow multiple seats. We'll loop for now or assume backend handles one.
                                    // Let's assume we iterate and book, or better:
                                    // If the user selected multiple seats, we should probably call it for each or verify API.
                                    // The requirement: { "eventId": "...", "seatNo": "A12", "amount": 50 }

                                    // We will process all selected seats.
                                    const bookingPromises = selectedSeats.map(seat =>
                                        createCheckout({
                                            eventId: event.id,
                                            seatNo: `Row ${seat.row}, Seat ${seat.number}`,
                                            amount: seat.price,
                                            tierType: selectedTier.type
                                        })
                                    );

                                    await Promise.all(bookingPromises);

                                    // 2. Clear Cart & Notify
                                    dispatch(cartEventCleared({ eventId: event.id }));
                                    setSelectedSeats([]);

                                    dispatch(toastAdded({
                                        message: `Successfully booked ${selectedSeats.length} ticket${selectedSeats.length !== 1 ? 's' : ''}!`,
                                        type: 'success',
                                    }));

                                    // 3. Redirect to Tickets Page (where they will be fetched via API)
                                    router.push(links.bookings);

                                } catch (error) {
                                    console.error('Booking error:', error);
                                    dispatch(toastAdded({
                                        message: 'Failed to complete booking. Please try again.',
                                        type: 'error',
                                    }));
                                } finally {
                                    setIsProcessing(false);
                                }
                            }}
                        >
                            {isProcessing ? 'PROCESSING...' : (isAuthed ? `CHECKOUT (${selectedSeats.length})` : 'LOGIN TO CHECKOUT')}
                        </button>

                        <div style={{
                            marginTop: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            color: '#444',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textAlign: 'center'
                        }}>
                            <p>STADIUM ENTRY TERMS APPLY</p>
                            <p>SECURE ENCRYPTED CHECKOUT</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
