import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/lib/store/authSlice";
import toastReducer from "@/lib/store/toastSlice";
import cartReducer from "@/lib/store/cartSlice";
import fixturesReducer from "@/lib/store/fixturesSlice";
import liveMatchesReducer from "@/lib/store/liveMatchesSlice";
import bookingsReducer from "@/lib/store/bookingsSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  toast: toastReducer,
  cart: cartReducer,
  fixtures: fixturesReducer,
  liveMatches: liveMatchesReducer,
  bookings: bookingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
