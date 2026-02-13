import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

export type AuthState = {
  status: AuthStatus;
  token: string | null;
  email: string | null;
  error: string | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

const initialState: AuthState = {
  status: "idle",
  token: null,
  email: null,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage: (state, action: PayloadAction<{ token: string | null; email: string | null }>) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.status = action.payload.token ? "authenticated" : "anonymous";
      state.error = null;
    },

    loginRequested: (state, _action: PayloadAction<AuthCredentials>) => {
      state.status = "loading";
      state.error = null;
    },
    registerRequested: (state, _action: PayloadAction<AuthCredentials>) => {
      state.status = "loading";
      state.error = null;
    },

    authSucceeded: (state, action: PayloadAction<{ token: string | null; email: string }>) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.status = action.payload.token ? "authenticated" : "anonymous";
      state.error = null;
    },

    authFailed: (state, action: PayloadAction<{ message: string }>) => {
      state.status = "anonymous";
      state.error = action.payload.message;
      state.token = null;
    },

    logoutRequested: (state) => {
      state.status = "anonymous";
      state.token = null;
      state.email = null;
      state.error = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  hydrateFromStorage,
  loginRequested,
  registerRequested,
  authSucceeded,
  authFailed,
  logoutRequested,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
