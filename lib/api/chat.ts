import { apiClient } from "@/lib/api/client";

export interface ChatAction {
    label: string;
    value: string;
    type?: 'button' | 'link';
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    actions?: ChatAction[];
}

export interface ChatResponse {
    text: string;
    actions?: ChatAction[];
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
    // Some backends might use 'message', 'query', or 'prompt' for input. We send 'message'.
    // We expect { text: "...", actions: [...] } but handle variations.
    const res = await apiClient.post<any>('/ai/chat', { message });
    const data = res.data;

    // Normalize response
    const text = data.text || data.message || data.reply || data.answer || data.content || "";
    const actions = Array.isArray(data.actions) ? data.actions : [];

    return { text, actions };
};
