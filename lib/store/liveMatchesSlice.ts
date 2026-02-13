import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MatchEvent } from "@/types/mockData";
import type { RootState } from "@/lib/store/rootReducer";

export type LiveMatchesStatus = "idle" | "loading" | "ready" | "error";

export type LiveMatchesState = {
  status: LiveMatchesStatus;
  items: MatchEvent[];
  error: string | null;
};

const initialState: LiveMatchesState = {
  status: "idle",
  items: [],
  error: null,
};

export const liveMatchesSlice = createSlice({
  name: "liveMatches",
  initialState,
  reducers: {
    liveMatchesRequested: (state) => {
      state.status = "loading";
      state.error = null;
    },

    liveMatchesSucceeded: (state, action: PayloadAction<{ items: MatchEvent[] }>) => {
      state.status = "ready";
      state.items = action.payload.items;
      state.error = null;
    },

    liveMatchesFailed: (state, action: PayloadAction<{ message: string }>) => {
      state.status = "error";
      state.items = [];
      state.error = action.payload.message;
    },

    liveMatchesCleared: (state) => {
      state.status = "idle";
      state.items = [];
      state.error = null;
    },
  },
});

export const {
  liveMatchesRequested,
  liveMatchesSucceeded,
  liveMatchesFailed,
  liveMatchesCleared,
} = liveMatchesSlice.actions;

export const selectLiveMatchesItems = (state: RootState) => state.liveMatches.items;
export const selectLiveMatchesStatus = (state: RootState) => state.liveMatches.status;
export const selectLiveMatchesError = (state: RootState) => state.liveMatches.error;

export default liveMatchesSlice.reducer;
