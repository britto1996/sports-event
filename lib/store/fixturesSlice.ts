import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MatchEvent } from "@/types/mockData";
import type { RootState } from "@/lib/store/rootReducer";

export type FixturesStatus = "idle" | "loading" | "ready" | "error";

export type FixturesState = {
  status: FixturesStatus;
  items: MatchEvent[];
  error: string | null;
  date: string | null;
};

const initialState: FixturesState = {
  status: "idle",
  items: [],
  error: null,
  date: null,
};

export const fixturesSlice = createSlice({
  name: "fixtures",
  initialState,
  reducers: {
    fixturesRequested: (state, action: PayloadAction<{ date?: string } | undefined>) => {
      state.status = "loading";
      state.error = null;
      state.date = action.payload?.date ?? null;
    },

    fixturesSucceeded: (state, action: PayloadAction<{ date: string | null; items: MatchEvent[] }>) => {
      state.status = "ready";
      state.items = action.payload.items;
      state.error = null;
      state.date = action.payload.date;
    },

    fixturesFailed: (state, action: PayloadAction<{ date: string | null; message: string }>) => {
      state.status = "error";
      state.items = [];
      state.error = action.payload.message;
      state.date = action.payload.date;
    },

    fixturesCleared: (state) => {
      state.status = "idle";
      state.items = [];
      state.error = null;
      state.date = null;
    },
  },
});

export const {
  fixturesRequested,
  fixturesSucceeded,
  fixturesFailed,
  fixturesCleared,
} = fixturesSlice.actions;

export const selectFixturesItems = (state: RootState) => state.fixtures.items;
export const selectFixturesStatus = (state: RootState) => state.fixtures.status;
export const selectFixturesError = (state: RootState) => state.fixtures.error;

export default fixturesSlice.reducer;
