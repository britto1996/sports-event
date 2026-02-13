import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SeatSelection } from "@/components/SeatMap";
import type { RootState } from "@/lib/store/rootReducer";

export type CartItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice?: number;
  eventId?: string;
  tierType?: string;
  seatId?: string;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartItemAdded: (state, action: PayloadAction<{ item: CartItem }>) => {
      const incoming = action.payload.item;
      if (incoming.quantity <= 0) return;
      state.items.push(incoming);
    },

    cartEventSeatsSet: (
      state,
      action: PayloadAction<{
        eventId: string;
        eventTitle: string;
        tierType: string;
        seats: SeatSelection[];
      }>
    ) => {
      const { eventId, eventTitle, tierType, seats } = action.payload;

      state.items = state.items.filter((i) => i.eventId !== eventId);

      const nextItems: CartItem[] = seats.map((seat) => ({
        id: `${eventId}:${tierType}:${seat.id}`,
        title: `${eventTitle} • Row ${seat.row}, Seat ${seat.number}`,
        quantity: 1,
        unitPrice: seat.price,
        eventId,
        tierType,
        seatId: seat.id,
      }));

      state.items.push(...nextItems);
    },

    cartEventCleared: (state, action: PayloadAction<{ eventId: string }>) => {
      state.items = state.items.filter((i) => i.eventId !== action.payload.eventId);
    },

    cartCleared: (state) => {
      state.items = [];
    },
  },
});

export const {
  cartItemAdded,
  cartEventSeatsSet,
  cartEventCleared,
  cartCleared,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
