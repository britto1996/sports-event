import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/lib/store/authSlice";
import toastReducer from "@/lib/store/toastSlice";
import cartReducer from "@/lib/store/cartSlice";
import fixturesReducer from "@/lib/store/fixturesSlice";
import liveMatchesReducer from "@/lib/store/liveMatchesSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  toast: toastReducer,
  cart: cartReducer,
  fixtures: fixturesReducer,
  liveMatches: liveMatchesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
