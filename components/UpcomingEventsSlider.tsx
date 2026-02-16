"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import Link from "next/link";
import { links } from "@/constants/path";
import type { MatchEvent } from "@/types/mockData";

interface UpcomingEventsSliderProps {
    events: MatchEvent[];
}

export default function UpcomingEventsSlider({ events }: UpcomingEventsSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(3);

    // Determine number of slides to show based on viewport
    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(window.innerWidth >= 768 ? 3 : 2);
        };

        handleResize(); // Set initial value
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalSlides = Math.ceil(events.length / slidesToShow);
    const startIndex = currentSlide * slidesToShow;
    const endIndex = startIndex + slidesToShow;
    const visibleEvents = events.slice(startIndex, endIndex);

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrev();
            if (e.key === "ArrowRight") goToNext();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToNext, goToPrev]);

    // If no events, show empty state
    if (events.length === 0) {
        return (
            <div style={{ marginTop: "2rem", color: "var(--muted)", fontWeight: 700 }}>
                No upcoming events available.
            </div>
        );
    }

    // If events fit in one slide, don't show navigation
    const showNavigation = events.length > slidesToShow;

    return (
        <div className="upcoming-events-slider">
            <div className="slider-content">
                <div className="grid-3">
                    {visibleEvents.map((event) => (
                        <MatchCard key={event.id} match={event} />
                    ))}
                </div>
            </div>

            {showNavigation && (
                <div className="slider-controls">
                    <button
                        onClick={goToPrev}
                        className="slider-btn slider-btn-prev"
                        aria-label="Previous slide"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12.5 15L7.5 10L12.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <div className="slider-counter">
                        <span style={{ fontWeight: 900 }}>
                            {currentSlide + 1} / {totalSlides}
                        </span>
                    </div>

                    <button
                        onClick={goToNext}
                        className="slider-btn slider-btn-next"
                        aria-label="Next slide"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.5 15L12.5 10L7.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <Link href={links.matchCenter} className="slider-view-all" aria-label="View all upcoming events">
                        <span style={{ marginRight: "0.5rem", fontWeight: 700, fontSize: "0.95rem" }}>
                            VIEW ALL
                        </span>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M7.5 15L12.5 10L7.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}
