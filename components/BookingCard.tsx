"use client";

import type { Booking } from "@/types/mockData";

interface BookingCardProps {
    booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
    const eventDate = new Date(booking.eventDate);
    const bookedDate = new Date(booking.bookedAt);

    return (
        <div className="ticket-card">
            {/* Event Header with gradient background */}
            <div className="ticket-header">
                <div className="ticket-header-content">
                    <span className="ticket-competition">{booking.tierType} TICKET</span>
                    <h3 className="ticket-title">{booking.eventTitle}</h3>
                    <p className="ticket-venue">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ display: "inline", marginRight: "0.35rem", verticalAlign: "middle" }}
                        >
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                                fill="currentColor"
                                opacity="0.7"
                            />
                            <circle cx="12" cy="9" r="2.5" fill="white" />
                        </svg>
                        {booking.venue}
                    </p>
                </div>
            </div>

            {/* Perforated line */}
            <div className="ticket-perforation"></div>

            {/* Ticket Body */}
            <div className="ticket-body">
                {/* Date and Time */}
                <div className="ticket-date-section">
                    <div className="ticket-info-row">
                        <span className="ticket-label">DATE & TIME</span>
                        <span className="ticket-value">
                            {eventDate.toLocaleString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                            })}
                        </span>
                    </div>
                </div>

                {/* Seats */}
                <div className="ticket-seats-section">
                    <span className="ticket-label">YOUR SEATS</span>
                    <div className="ticket-seats-grid">
                        {booking.seats.map((seat, index) => (
                            <div key={seat.id} className="ticket-seat-badge">
                                {seat.row}
                                {seat.number}
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Code and Booking Details */}
                <div className="ticket-qr-section">
                    <div className="ticket-qr-container">
                        <img
                            src={booking.qrCode}
                            alt="Booking QR Code"
                            className="ticket-qr-image"
                        />
                        <p className="ticket-scan-text">SCAN TO VERIFY</p>
                    </div>

                    <div className="ticket-booking-details">
                        <div className="ticket-info-row">
                            <span className="ticket-label">BOOKING ID</span>
                            <span className="ticket-booking-ref">{booking.bookingReference}</span>
                        </div>

                        <div className="ticket-info-row">
                            <span className="ticket-label">SEATS</span>
                            <span className="ticket-value">{booking.seats.length} × {booking.tierType}</span>
                        </div>

                        <div className="ticket-info-row">
                            <span className="ticket-label">TOTAL PAID</span>
                            <span className="ticket-price">${booking.totalPrice}</span>
                        </div>

                        <div className="ticket-info-row" style={{ marginTop: "0.75rem" }}>
                            <span className="ticket-label">BOOKED ON</span>
                            <span className="ticket-value ticket-booked-date">
                                {bookedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Valid Entry Badge */}
                <div className="ticket-footer">
                    <div className={`ticket-status-badge ${booking.status}`}>
                        {booking.status === "confirmed" ? (
                            <>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ marginRight: "0.5rem" }}
                                >
                                    <path
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                        fill="currentColor"
                                    />
                                </svg>
                                VALID ENTRY PASS
                            </>
                        ) : (
                            "CANCELLED"
                        )}
                    </div>
                    <span className="ticket-terms">Terms & Conditions Apply</span>
                </div>
            </div>

            <style jsx>{`
        .ticket-card {
          background: var(--card-bg);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .ticket-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .ticket-header {
          background: linear-gradient(135deg, var(--accent) 0%, #cc2b4a 100%);
          padding: 2rem 1.75rem 1.5rem;
          color: #ffffff;
          position: relative;
        }

        .ticket-header::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 20px;
          background: radial-gradient(
            circle at 10px 0px,
            transparent 0,
            transparent 10px,
            var(--card-bg) 10px
          );
          background-size: 20px 20px;
          background-position: 0 0;
        }

        .ticket-header-content {
          position: relative;
          z-index: 1;
        }

        .ticket-competition {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .ticket-title {
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          line-height: 1.2;
          color: #ffffff;
        }

        .ticket-venue {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
        }

        .ticket-perforation {
          height: 1px;
          background: repeating-linear-gradient(
            to right,
            var(--border-subtle) 0,
            var(--border-subtle) 8px,
            transparent 8px,
            transparent 16px
          );
          margin: 0;
        }

        .ticket-body {
          padding: 1.75rem;
          background: var(--surface-0);
        }

        .ticket-date-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .ticket-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .ticket-label {
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 1px;
          color: var(--muted);
          text-transform: uppercase;
        }

        .ticket-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .ticket-seats-section {
          margin-bottom: 1.75rem;
        }

        .ticket-seats-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .ticket-seat-badge {
          padding: 0.5rem 0.85rem;
          background: var(--surface-1);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: 0.5px;
        }

        .ticket-qr-section {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          padding: 1.25rem;
          background: var(--background);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          margin-bottom: 1.25rem;
        }

        .ticket-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .ticket-qr-image {
          width: 120px;
          height: 120px;
          border: 3px solid var(--foreground);
          border-radius: 8px;
          padding: 4px;
          background: #ffffff;
        }

        .ticket-scan-text {
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: var(--muted);
          text-align: center;
        }

        .ticket-booking-details {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          justify-content: center;
        }

        .ticket-booking-ref {
          font-family: "Courier New", monospace;
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: 1px;
        }

        .ticket-price {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--accent);
        }

        .ticket-booked-date {
          font-size: 0.8rem;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ticket-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.6rem 1.1rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ticket-status-badge.confirmed {
          background: rgba(212, 255, 0, 0.12);
          color: var(--accent);
          border: 1px solid var(--accent);
        }

        .ticket-status-badge.cancelled {
          background: rgba(255, 0, 0, 0.1);
          color: #ff4444;
          border: 1px solid #ff4444;
        }

        .ticket-terms {
          font-size: 0.65rem;
          color: var(--muted);
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .ticket-qr-section {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .ticket-qr-container {
            margin: 0 auto;
          }

          .ticket-booking-details {
            align-items: center;
          }

          .ticket-info-row {
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }
        }
      `}</style>
        </div>
    );
}
