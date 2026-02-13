import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
};

export type ToastState = {
  items: Toast[];
};

const initialState: ToastState = {
  items: [],
};

const createId = () => {
  const uuidFn = globalThis.crypto?.randomUUID;
  if (typeof uuidFn === "function") return uuidFn.call(globalThis.crypto);
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    toastAdded: (state, action: PayloadAction<{ type: ToastType; message: string; id?: string }>) => {
      const id = action.payload.id ?? createId();
      state.items.unshift({
        id,
        type: action.payload.type,
        message: action.payload.message,
        createdAt: Date.now(),
      });
      state.items = state.items.slice(0, 3);
    },
    toastRemoved: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((t) => t.id !== action.payload.id);
    },
    toastsCleared: (state) => {
      state.items = [];
    },
  },
});

export const { toastAdded, toastRemoved, toastsCleared } = toastSlice.actions;
export default toastSlice.reducer;
