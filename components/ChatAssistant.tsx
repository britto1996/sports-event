"use client";

import { useState, useRef, useEffect } from 'react';
import mockData from "@/data/mockData.json";

const ChatAssistant = () => {
    const [messages, setMessages] = useState<{ id: number; sender: string; text: string }[]>(
        mockData.aiChat.initialMessages as { id: number; sender: string; text: string }[]
    );
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

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
        <div className="card" style={{
            height: "700px",
            display: "flex",
            flexDirection: "column",
            maxWidth: "900px",
            margin: "0 auto",
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-0)",
            borderRadius: "0"
        }}>
            <div style={{ padding: "3rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-0)" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "1rem", letterSpacing: "-0.5px" }}>
                    <span style={{ height: "12px", width: "12px", background: "var(--accent)", borderRadius: "50%", boxShadow: "0 0 10px var(--accent)" }}></span>
                    MATCH ASSISTANT v.4.0
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "800", marginTop: '0.5rem', letterSpacing: '1px' }}>CONNECTED • READY TO ASSIST</p>
            </div>

            <div style={{ flex: 1, padding: "3rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                            background: msg.sender === "user" ? "var(--primary)" : "var(--surface-1)",
                            color: msg.sender === "user" ? "var(--primary-inv)" : "var(--foreground)",
                            padding: "1.25rem 2rem",
                            borderRadius: "0",
                            maxWidth: "80%",
                            fontWeight: "700",
                            fontSize: "1rem",
                            border: msg.sender === "bot" ? "1px solid var(--border-subtle)" : "none"
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "2rem 3rem", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "1rem", flexDirection: 'column' }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="ASK ANYTHING..."
                        style={{
                            flex: 1,
                            padding: "1.25rem 1.5rem",
                            borderRadius: "30px",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--surface-0)",
                            color: "var(--foreground)",
                            outline: "none",
                            fontWeight: "700",
                            fontSize: "0.9rem"
                        }}
                    />
                    <button className="btn" onClick={handleSend} style={{ borderRadius: '30px', padding: '0 2.5rem' }}>
                        SEND
                    </button>
                </div>

                {/* Suggestions */}
                <div style={{ display: "flex", gap: "1rem", overflowX: "auto", padding: '1rem 0' }}>
                    {mockData.aiChat.suggestedPrompts.map((prompt: string, i: number) => (
                        <button
                            key={i}
                            onClick={() => setInput(prompt)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border-subtle)',
                                background: 'transparent',
                                color: 'var(--muted)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
