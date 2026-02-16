"use client";

import { type PropsWithChildren, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store/store";
import ToastContainer from "@/components/ToastContainer";
import AuthHydrator from "@/components/AuthHydrator";
import { AuthProvider } from "@/components/AuthProvider";

export default function ReduxProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthProvider>
        <AuthHydrator />
        {children}
        <ToastContainer />
      </AuthProvider>
    </Provider>
  );
}
