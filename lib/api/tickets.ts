import { apiClient } from "@/lib/api/client";
import type { Booking } from "@/types/mockData";

export interface CreateCheckoutPayload {
    eventId: string;
    seatNo: string; // "Row A, Seat 12" or similar identifier
    amount: number;
    tierType: string; // Added for context, though API might only strictly require the user's specific fields
}

export interface CheckoutResponse {
    success: boolean;
    bookingId: string;
    message?: string;
    ticket?: Booking; // Assuming the API returns the created ticket/booking object
}

export const createCheckout = async (data: CreateCheckoutPayload): Promise<CheckoutResponse> => {
    // Map the payload to exactly what the user requested: { eventId, seatNo, amount }
    // We include tierType in the payload if the backend supports it, otherwise it might just use seatNo to determine tier
    const payload = {
        eventId: data.eventId,
        seatNo: data.seatNo,
        amount: data.amount,
    };

    const res = await apiClient.post<CheckoutResponse>('/payments/create-checkout', payload);
    return res.data;
};

export const getBookedTickets = async (): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>('/tickets');
    // Ensure we return an array
    return Array.isArray(res.data) ? res.data : [];
};
