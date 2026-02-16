"use client";

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, type ChatAction } from '@/lib/api/chat';
import { createCheckout } from '@/lib/api/tickets';
import { getEventById, fetchEvents } from '@/lib/api/events';
import { useAuth } from "@/components/AuthProvider";
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    actions?: ChatAction[];
}

interface BookingState {
    isActive: boolean;
    step: 'loading' | 'select-seat' | 'confirm' | 'success';
    event: { name: string, date: string, id: string, venue?: string } | null;
    seat: string | null;
    isProcessing: boolean;
}

const BotIcon = () => (
    <div style={{
        width: 32, height: 32, borderRadius: "50%", background: "var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5.73C6.4 5.39 6 4.74 6 4a2 2 0 0 1 2-2h4zm0 2h-2v1h2V4z" />
            <path d="M12 13v8" />
            <path d="M9 21h6" />
            <path d="M4 11h16" />
        </svg>
    </div>
);

const UserIcon = ({ letter }: { letter: string }) => (
    <div style={{
        width: 32, height: 32, borderRadius: "50%", background: "var(--surface-3)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)"
    }}>
        {letter}
    </div>
);

const CalendarDate = ({ dateString }: { dateString: string }) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return <span style={{ fontWeight: 600 }}>{dateString}</span>;

        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = date.getDate();

        return (
            <div style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'var(--surface-0)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', overflow: 'hidden', minWidth: '40px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginRight: '8px', verticalAlign: 'middle'
            }}>
                <div style={{
                    background: 'var(--accent)', color: 'white', fontSize: '0.6rem',
                    fontWeight: 700, width: '100%', textAlign: 'center', padding: '2px 0'
                }}>
                    {month}
                </div>
                <div style={{
                    color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 700,
                    padding: '2px 0 4px'
                }}>
                    {day}
                </div>
            </div>
        );
    } catch (e) {
        return <span>{dateString}</span>;
    }
};

const ChatAssistant = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'bot', text: "Hello! I'm your match-day assistant. I can help you find events and book tickets directly here." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [booking, setBooking] = useState<BookingState>({
        isActive: false, step: 'select-seat', event: null, seat: null, isProcessing: false
    });

    console.log("booking", booking);

    const { logout, user } = useAuth();
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userInitial = user?.name?.[0]?.toUpperCase() || "U";

    const [suggestedPrompts] = useState([
        "Upcoming fixtures",
        "My bookings",
        "Stadium parking",
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!open) return;
        scrollToBottom();
    }, [messages, open, booking.isActive]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now(), sender: "user", text: textToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Reset booking state if user types something new
        if (booking.isActive) {
            setBooking(prev => ({ ...prev, isActive: false }));
        }

        try {
            const response = await sendChatMessage(textToSend);
            const botMsg: Message = {
                id: Date.now() + 1,
                sender: "bot",
                text: response.text,
                actions: response.actions
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
                setShowAuthModal(true);
            } else {
                const errorMsg: Message = {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: "Sorry, I'm having trouble connecting. Please try again later."
                };
                setMessages((prev) => [...prev, errorMsg]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const startBooking = async (eventName: string, dateStr: string) => {
        setBooking({
            isActive: true,
            step: 'loading',
            event: null,
            seat: null,
            isProcessing: true
        });

        try {
            // 1. Try to find the event by name to get the ID
            const allEvents = await fetchEvents();
            // Fuzzy match: check if event title includes the name from chat or vice versa
            // The chat name might be "Team A vs Team B", title might be same.
            const foundEvent = allEvents.find(e =>
                e.title.toLowerCase().includes(eventName.toLowerCase()) ||
                eventName.toLowerCase().includes(e.title.toLowerCase())
            );

            if (foundEvent) {
                // 2. Fetch full details (though fetchEvents might already have them, good to be explicit as per requirement)
                const fullDetails = await getEventById(foundEvent.id) || foundEvent;

                setBooking({
                    isActive: true,
                    step: 'select-seat',
                    event: {
                        name: fullDetails.title,
                        date: fullDetails.date,
                        id: fullDetails.id,
                        venue: fullDetails.venue
                    },
                    seat: null,
                    isProcessing: false
                });
            } else {
                // Fallback if not found (or maybe the chat *should* have returned IDs)
                // For now, we use a mock ID but let the user proceed (or show error)
                console.warn("Event not found in API, using mock ID");
                setBooking({
                    isActive: true,
                    step: 'select-seat',
                    event: { name: eventName, date: dateStr, id: 'evt-' + Date.now(), venue: 'TBA' },
                    seat: null,
                    isProcessing: false
                });
            }
        } catch (e) {
            console.error("Failed to start booking", e);
            setBooking(prev => ({ ...prev, isActive: false }));
            alert("Could not load event details.");
        }
    };

    const confirmBooking = async () => {
        if (!booking.event || !booking.seat) return;
        setBooking(prev => ({ ...prev, isProcessing: true }));
        try {
            await createCheckout({
                eventId: booking.event.id,
                seatNo: booking.seat,
                amount: 150, // Mock amount
                tierType: 'Standard'
            });
            setBooking(prev => ({ ...prev, step: 'success', isProcessing: false }));
            // Add confirmation message to chat
            const successMsg: Message = {
                id: Date.now(),
                sender: 'bot',
                text: `Booking Confirmed!\nEvent: ${booking.event.name}\nSeat: ${booking.seat}\nDate: ${booking.event.date}`
            };
            setMessages(prev => [...prev, successMsg]);
        } catch (e) {
            console.error(e);
            setBooking(prev => ({ ...prev, isProcessing: false }));
            alert("Booking failed. Please try again.");
        }
    };

    // Advanced Rendering Logic
    const renderStyledMessage = (text: string) => {
        if (!text) return null;

        // Clean up common artifacts first
        const cleanText = text.replace(/\\n/g, '\n').replace(/\n\n/g, '\n').trim();
        const lines = cleanText.split('\n');

        const renderedLines: React.ReactNode[] = [];
        let hasInteractiveEvents = false;

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Detect format: "1. Team A vs Team B - MM/DD/YYYY, HH:MM:SS PM"
            // Regex explanation:
            // ^\d+[\.:]?\s+Match number
            // (.*?)        Event Name (non-greedy)
            // \s+-\s+      Separator " - "
            // (\d{1,2}\/\d{1,2}\/\d{4}) Date (MM/DD/YYYY)
            // ,?\s*        Optional comma/space
            // (\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?) Time
            const eventRegex = /^\d+[\.:]?\s+(.*?)\s+-\s+(\d{1,2}\/\d{1,2}\/\d{4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i;
            const match = trimmed.match(eventRegex);

            if (match) {
                hasInteractiveEvents = true;
                const [, eventName, dateStr, timeStr] = match;

                renderedLines.push(
                    <button
                        key={`evt-${index}`}
                        onClick={() => startBooking(eventName, dateStr)}
                        className="event-action-btn"
                        style={{
                            display: 'flex', alignItems: 'center', width: '100%',
                            padding: '12px 14px', marginTop: '8px', marginBottom: '8px',
                            background: 'var(--surface-0)', border: '1px solid var(--border-subtle)',
                            borderRadius: '16px', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <CalendarDate dateString={dateStr} />
                        <div style={{ flex: 1, marginLeft: '4px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: 1.3 }}>
                                {eventName}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{timeStr}</span>
                                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor' }}></span>
                                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Book Ticket</span>
                            </div>
                        </div>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                );
            } else {
                // If line contains instructions to reply with number, skip plain text rendering if we have buttons
                if (/reply with (the )?number/i.test(trimmed)) {
                    return;
                }

                // Booking Confirmation Block
                if (trimmed.includes("Booking Confirmed") || (trimmed.startsWith("Event:") && renderedLines.length === 0)) {
                    renderedLines.push(
                        <div key={index} style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                            {trimmed}
                        </div>
                    );
                } else if (trimmed.startsWith("Event: ") || trimmed.startsWith("Seat: ") || trimmed.startsWith("Date: ")) {
                    const [label, ...val] = trimmed.split(':');
                    renderedLines.push(
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '2px' }}>
                            <span style={{ color: 'var(--muted)' }}>{label}:</span>
                            <span style={{ fontWeight: 500 }}>{val.join(':')}</span>
                        </div>
                    );

                } else {
                    renderedLines.push(<div key={index} style={{ marginBottom: '4px', lineHeight: 1.5 }}>{trimmed}</div>);
                }
            }
        });

        return <div style={{ display: 'flex', flexDirection: 'column' }}>{renderedLines}</div>;
    };

    return (
        <div
            style={{
                position: "fixed", right: "24px", bottom: "24px", zIndex: 2000,
                display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", pointerEvents: "none",
            }}
        >
            {open && (
                <div
                    className="card fade-in-up"
                    style={{
                        width: "min(400px, calc(100vw - 40px))", height: "min(640px, calc(100vh - 100px))",
                        display: "flex", flexDirection: "column", background: "var(--surface-1)",
                        pointerEvents: "auto", overflow: "hidden", borderRadius: "24px",
                        boxShadow: "var(--shadow-4)", border: "1px solid var(--border-subtle)",
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "var(--surface-2)", backdropFilter: "blur(10px)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ position: "relative" }}>
                                <BotIcon />
                                <span style={{
                                    position: "absolute", bottom: -2, right: -2, width: 10, height: 10,
                                    background: "#10B981", borderRadius: "50%", border: "2px solid var(--surface-2)"
                                }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, letterSpacing: "-0.2px", fontSize: "1rem" }}>Assistant</div>
                                <div style={{ color: "var(--muted)", fontWeight: 500, fontSize: "0.75rem" }}>Online • Support Team</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} style={{ pointerEvents: "auto", color: "var(--muted)", background: 'none', border: 'none', cursor: 'pointer' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="custom-scrollbar" style={{
                        flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "var(--background)",
                    }}>
                        {messages.map((msg) => {
                            const hasActions = msg.actions && msg.actions.length > 0;
                            const renderedContent = renderStyledMessage(msg.text);

                            if (!renderedContent && !hasActions) return null;

                            return (
                                <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: "12px", alignItems: "flex-end" }}>
                                    {msg.sender === "bot" && <BotIcon />}
                                    <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", gap: "4px", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                                        {renderedContent && (
                                            <div style={{
                                                background: msg.sender === "user" ? "var(--accent)" : "var(--surface-2)",
                                                color: msg.sender === "user" ? "#ffffff" : "var(--foreground)",
                                                padding: "12px 16px", borderRadius: "20px",
                                                borderBottomRightRadius: msg.sender === "user" ? "4px" : "20px",
                                                borderBottomLeftRadius: msg.sender === "bot" ? "4px" : "20px",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                                width: '100%'
                                            }}>
                                                {renderedContent}
                                            </div>
                                        )}
                                        {hasActions && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                                                {msg.actions!.map((action, idx) => (
                                                    <button key={idx} onClick={() => handleSend(action.value)} className="btn-chip"
                                                        style={{
                                                            fontSize: "0.8rem", padding: "8px 16px", borderRadius: "999px",
                                                            background: "var(--surface-0)", border: "1px solid var(--accent)", color: "var(--accent)",
                                                            cursor: "pointer", fontWeight: 600
                                                        }}>
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.sender === "user" && <UserIcon letter={userInitial} />}
                                </div>
                            );
                        })}

                        {booking.isActive && (
                            <div className="fade-in-up" style={{
                                background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
                                borderRadius: '16px', padding: '16px', margin: '10px 0 10px 44px', boxShadow: 'var(--shadow-3)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Book Ticket</h4>
                                    <button onClick={() => setBooking(prev => ({ ...prev, isActive: false }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
                                </div>

                                {booking.step === 'loading' && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                                        Loading event details...
                                    </div>
                                )}

                                {booking.step === 'select-seat' && (
                                    <>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--muted)' }}>
                                            Event: <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{booking.event?.name}</span>
                                        </div>
                                        {booking.event?.venue && (
                                            <div style={{ fontSize: '0.8rem', marginBottom: '12px', color: 'var(--muted)' }}>
                                                Venue: <span style={{ color: 'var(--foreground)' }}>{booking.event.venue}</span>
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                                            Select a seat:
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                                            {['A1', 'A2', 'A3', 'B1', 'B2', 'B3'].map(seat => (
                                                <button key={seat}
                                                    onClick={() => setBooking(prev => ({ ...prev, seat }))}
                                                    style={{
                                                        padding: '10px', borderRadius: '8px', border: booking.seat === seat ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                                                        background: booking.seat === seat ? 'var(--accent-subtle)' : 'var(--surface-0)',
                                                        cursor: 'pointer', fontWeight: 600
                                                    }}
                                                >
                                                    {seat}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setBooking(prev => ({ ...prev, step: 'confirm' }))}
                                            disabled={!booking.seat}
                                            className="btn"
                                            style={{ width: '100%', borderRadius: '12px', opacity: booking.seat ? 1 : 0.5 }}
                                        >
                                            Continue
                                        </button>
                                    </>
                                )}

                                {booking.step === 'confirm' && (
                                    <>
                                        <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: 'var(--muted)' }}>Event:</span>
                                                <span style={{ fontWeight: 600 }}>{booking.event?.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: 'var(--muted)' }}>Date:</span>
                                                <span style={{ fontWeight: 600 }}>{booking.event?.date || "TBA"}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: 'var(--muted)' }}>Seat:</span>
                                                <span style={{ fontWeight: 600 }}>{booking.seat}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                                                <span style={{ fontWeight: 600 }}>Total:</span>
                                                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>$150.00</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={confirmBooking}
                                            disabled={booking.isProcessing}
                                            className="btn"
                                            style={{ width: '100%', borderRadius: '12px' }}
                                        >
                                            {booking.isProcessing ? 'Processing...' : 'Pay & Book'}
                                        </button>
                                    </>
                                )}

                                {booking.step === 'success' && (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                                        <h4 style={{ margin: '0 0 8px' }}>Booked Successfully!</h4>
                                        <button onClick={() => { setBooking(prev => ({ ...prev, isActive: false })); router.push('/tickets'); }} className="btn-secondary" style={{ marginTop: '12px' }}>
                                            View Tickets
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isLoading && (
                            /* Loading Indicator */
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                                <BotIcon />
                                <div style={{ background: "var(--surface-2)", padding: "12px 16px", borderRadius: "20px", borderBottomLeftRadius: "4px" }}>
                                    <div className="typing-indicator"><span /><span /><span /></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-2)" }}>
                        {suggestedPrompts.length > 0 && messages.length < 3 && (
                            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
                                {suggestedPrompts.map((prompt, i) => (
                                    <button key={i} onClick={() => handleSend(prompt)} style={{
                                        whiteSpace: "nowrap", padding: "8px 16px", borderRadius: "12px", border: "1px solid var(--border-subtle)",
                                        background: "var(--surface-0)", color: "var(--foreground)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600
                                    }}>
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                disabled={isLoading} placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: "14px 20px", borderRadius: "24px", border: "1px solid var(--border-subtle)",
                                    background: "var(--surface-0)", color: "var(--foreground)", outline: "none", fontWeight: 500, fontSize: "0.95rem"
                                }}
                            />
                            <button className="btn-icon-send" onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                                style={{
                                    width: 48, height: 48, borderRadius: "50%", background: input.trim() ? "var(--accent)" : "var(--surface-3)",
                                    color: input.trim() ? "#ffffff" : "var(--muted)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed"
                                }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Auth Modal (Same as before) */}
            {showAuthModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "min(320px, 90vw)", padding: "24px", background: "var(--card-bg)", textAlign: "center", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <h3>Session Expired</h3>
                        <p>Please log in again.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowAuthModal(false)} className="btn-secondary" style={{ flex: 1 }}>Close</button>
                            <Link href="/login" className="btn" style={{ flex: 1 }} onClick={() => setShowAuthModal(false)}>Log In</Link>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={() => setOpen((v) => !v)} className="btn-chat-toggle" style={{ height: "64px", width: open ? "64px" : "auto", padding: open ? 0 : "0 24px", borderRadius: "999px", pointerEvents: "auto", boxShadow: "var(--shadow-4)", background: "var(--accent)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: 'pointer' }}>
                {open ? <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> : <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", fontSize: "1.1rem", fontWeight: 700 }}><BotIcon /><span>Chat Assistant</span></span>}
            </button>
            <style jsx>{`
                .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
                .typing-indicator span { width: 6px; height: 6px; background: var(--muted); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                .fade-in-up { animation: fadeInUp 0.3s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 99px; }
            `}</style>
        </div>
    );
};

export default ChatAssistant;
