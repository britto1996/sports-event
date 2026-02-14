import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Booking } from "@/types/mockData";
import type { RootState } from "@/lib/store/rootReducer";

export type BookingsStatus = "idle" | "loading" | "ready" | "error";

export type BookingsState = {
    status: BookingsStatus;
    items: Booking[];
    error: string | null;
};

const initialState: BookingsState = {
    status: "idle",
    items: [],
    error: null,
};

export const bookingsSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        bookingAdded: (state, action: PayloadAction<Booking>) => {
            state.items.unshift(action.payload); // Add to beginning (most recent first)
            state.status = "ready";
        },

        bookingsRequested: (state) => {
            state.status = "loading";
            state.error = null;
        },

        bookingsSucceeded: (state, action: PayloadAction<{ items: Booking[] }>) => {
            state.status = "ready";
            state.items = action.payload.items;
            state.error = null;
        },

        bookingsFailed: (state, action: PayloadAction<{ message: string }>) => {
            state.status = "error";
            state.error = action.payload.message;
        },

        bookingsCleared: (state) => {
            state.status = "idle";
            state.items = [];
            state.error = null;
        },
    },
});

export const {
    bookingAdded,
    bookingsRequested,
    bookingsSucceeded,
    bookingsFailed,
    bookingsCleared,
} = bookingsSlice.actions;

export const selectBookings = (state: RootState) => state.bookings.items;
export const selectBookingsStatus = (state: RootState) => state.bookings.status;
export const selectBookingsError = (state: RootState) => state.bookings.error;
export const selectBookingsCount = (state: RootState) => state.bookings.items.length;

// Get all booked seat IDs for a specific event
export const selectBookedSeatIds = (eventId: string) => (state: RootState): string[] => {
    const eventBookings = state.bookings.items.filter(booking => booking.eventId === eventId);
    const seatIds: string[] = [];
    eventBookings.forEach(booking => {
        booking.seats.forEach(seat => {
            seatIds.push(seat.id);
        });
    });
    return seatIds;
};

export default bookingsSlice.reducer;
