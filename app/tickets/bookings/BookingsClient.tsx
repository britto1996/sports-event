"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { selectBookings, selectBookingsStatus } from "@/lib/store/bookingsSlice";
import BookingCard from "@/components/BookingCard";
import Link from "next/link";
import { links } from "@/constants/path";
import { useEffect, useRef, useState } from "react";

const ITEMS_PER_PAGE_DESKTOP = 9;
const ITEMS_PER_BATCH_MOBILE = 10;
const ITEMS_LOAD_MORE_MOBILE = 5;

export default function BookingsClient() {
    const bookings = useAppSelector(selectBookings);
    const status = useAppSelector(selectBookingsStatus);

    // Pagination state for desktop
    const [currentPage, setCurrentPage] = useState(1);

    // Infinite scroll state for mobile
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH_MOBILE);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile/desktop
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Infinite scroll for mobile
    useEffect(() => {
        if (!isMobile || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < bookings.length) {
                    setVisibleCount((prev) => Math.min(prev + ITEMS_LOAD_MORE_MOBILE, bookings.length));
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isMobile, visibleCount, bookings.length]);

    // Reset pagination when bookings change
    useEffect(() => {
        setCurrentPage(1);
        setVisibleCount(ITEMS_PER_BATCH_MOBILE);
    }, [bookings.length]);

    if (status === "loading") {
        return (
            <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", fontWeight: 700, fontSize: "1.1rem" }}>
                    Loading your bookings...
                </p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="container" style={{ padding: "8rem 2rem", textAlign: "center" }}>
                <h1
                    className="gradient-text"
                    style={{
                        fontSize: "clamp(2rem, 4.5vw, 3rem)",
                        marginBottom: "1.5rem",
                        lineHeight: 1.1,
                    }}
                >
                    No bookings yet
                </h1>
                <p
                    style={{
                        color: "var(--muted)",
                        marginBottom: "3rem",
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        maxWidth: "500px",
                        margin: "0 auto 3rem",
                    }}
                >
                    Your booked tickets will appear here. Start by booking tickets for upcoming matches.
                </p>
                <Link
                    href={links.tickets}
                    className="btn"
                    style={{
                        padding: "1rem 2rem",
                        fontSize: "0.9rem",
                        borderRadius: "30px",
                    }}
                >
                    BROWSE TICKETS
                </Link>
            </div>
        );
    }

    // Desktop pagination
    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE_DESKTOP);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_DESKTOP;
    const endIndex = startIndex + ITEMS_PER_PAGE_DESKTOP;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    // Mobile infinite scroll
    const visibleBookings = bookings.slice(0, visibleCount);

    const displayBookings = isMobile ? visibleBookings : paginatedBookings;

    return (
        <div className="container" style={{ padding: "8rem 2rem 4rem" }}>
            <h1
                className="gradient-text"
                style={{
                    textAlign: "center",
                    fontSize: "clamp(2rem, 4.5vw, 3rem)",
                    marginBottom: "1rem",
                    lineHeight: 1.1,
                }}
            >
                My Bookings
            </h1>
            <p
                style={{
                    color: "var(--muted)",
                    marginBottom: "4rem",
                    maxWidth: "600px",
                    margin: "0 auto 4rem",
                    textAlign: "center",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                }}
            >
                Your confirmed ticket bookings for upcoming matches
            </p>

            <div className="grid-3" style={{ marginBottom: "3rem" }}>
                {displayBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>

            {/* Desktop Pagination */}
            {!isMobile && totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                        alignItems: "center",
                        marginTop: "3rem",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-secondary"
                        style={{
                            padding: "0.75rem 1.25rem",
                            fontSize: "0.85rem",
                            borderRadius: "20px",
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        ← PREV
                    </button>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className="btn btn-secondary"
                                style={{
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.85rem",
                                    borderRadius: "20px",
                                    background: page === currentPage ? "var(--accent)" : "transparent",
                                    color: page === currentPage ? "var(--background)" : "var(--foreground)",
                                    border: `1px solid ${page === currentPage ? "var(--accent)" : "var(--border-subtle)"}`,
                                    fontWeight: page === currentPage ? 900 : 600,
                                }}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-secondary"
                        style={{
                            padding: "0.75rem 1.25rem",
                            fontSize: "0.85rem",
                            borderRadius: "20px",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        NEXT →
                    </button>
                </div>
            )}

            {/* Mobile Infinite Scroll Trigger */}
            {isMobile && visibleCount < bookings.length && (
                <div ref={loadMoreRef} style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ color: "var(--muted)", fontWeight: 700 }}>Loading more...</p>
                </div>
            )}
        </div>
    );
}
