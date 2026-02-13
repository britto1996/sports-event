"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import mockData from "@/data/mockData.json";

const ChatAssistant = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ id: number; sender: string; text: string }[]>(
        mockData.aiChat.initialMessages as { id: number; sender: string; text: string }[]
    );
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestedPrompts = useMemo(
        () => mockData.aiChat.suggestedPrompts as string[],
        []
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!open) return;
        scrollToBottom();
    }, [messages, open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            let responseText = "I can help with that! Check out our latest team stats in the Match Center.";
            if (input.toLowerCase().includes("ticket")) {
                responseText = "Secure your tickets now for the upcoming fixtures. Tickets are selling fast.";
            } else if (input.toLowerCase().includes("score") || input.toLowerCase().includes("stat")) {
                responseText = "Live analytics are streaming directly to the Match Center. View current match-day data now.";
            }

            const botMsg = { id: Date.now() + 1, sender: "bot", text: responseText };
            setMessages((prev) => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div
            style={{
                position: "fixed",
                right: "24px",
                bottom: "24px",
                zIndex: 2000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "12px",
                pointerEvents: "none",
            }}
            aria-label="Chat assistant"
        >
            {open && (
                <div
                    className="card"
                    style={{
                        width: "min(420px, calc(100vw - 48px))",
                        height: "min(560px, calc(100vh - 140px))",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--card-bg)",
                        pointerEvents: "auto",
                        overflow: "hidden",
                    }}
                    role="dialog"
                    aria-modal="false"
                >
                    <div
                        style={{
                            padding: "14px 14px",
                            borderBottom: "1px solid var(--card-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            background: "var(--surface-2)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                                aria-hidden="true"
                                style={{
                                    height: "10px",
                                    width: "10px",
                                    background: "var(--accent)",
                                    borderRadius: "999px",
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>Chat Assistant</div>
                                <div style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.85rem" }}>
                                    Online • Typical reply in seconds
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="icon-btn"
                            aria-label="Close chat"
                            onClick={() => setOpen(false)}
                            style={{ pointerEvents: "auto" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            padding: "14px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            background: "var(--surface-2)",
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                    background: msg.sender === "user" ? "var(--accent)" : "var(--surface-1)",
                                    color: msg.sender === "user" ? "#ffffff" : "var(--foreground)",
                                    padding: "10px 12px",
                                    borderRadius: "14px",
                                    maxWidth: "82%",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    border: msg.sender === "bot" ? "1px solid var(--card-border)" : "none",
                                    lineHeight: 1.35,
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div
                        style={{
                            padding: "12px",
                            borderTop: "1px solid var(--card-border)",
                            background: "var(--card-bg)",
                        }}
                    >
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask about fixtures, tickets, or live stats..."
                                style={{
                                    flex: 1,
                                    padding: "12px 14px",
                                    borderRadius: "999px",
                                    border: "1px solid var(--card-border)",
                                    background: "var(--surface-0)",
                                    color: "var(--foreground)",
                                    outline: "none",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                }}
                            />
                            <button
                                className="btn"
                                onClick={handleSend}
                                style={{ padding: "0 16px", borderRadius: "999px" }}
                                type="button"
                            >
                                Send
                            </button>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                overflowX: "auto",
                                padding: "10px 2px 0",
                            }}
                        >
                            {suggestedPrompts.slice(0, 4).map((prompt: string, i: number) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setInput(prompt)}
                                    style={{
                                        whiteSpace: "nowrap",
                                        padding: "8px 12px",
                                        borderRadius: "999px",
                                        border: "1px solid var(--card-border)",
                                        background: "var(--surface-0)",
                                        color: "var(--foreground)",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                        fontWeight: 650,
                                    }}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="btn"
                style={{
                    height: "52px",
                    width: open ? "52px" : "auto",
                    padding: open ? 0 : "0 16px",
                    borderRadius: "999px",
                    pointerEvents: "auto",
                    boxShadow: "var(--shadow-2)",
                }}
                aria-label={open ? "Minimize chat" : "Open chat"}
            >
                {open ? (
                    <span style={{ fontWeight: 900, fontSize: "1.2rem", lineHeight: 1 }}>×</span>
                ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                        <span
                            aria-hidden="true"
                            style={{
                                height: "10px",
                                width: "10px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.95)",
                            }}
                        />
                        Chat
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;
