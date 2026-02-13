"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { hydrateFromStorage } from "@/lib/store/authSlice";
import { readStoredAuth } from "@/lib/authStorage";

export default function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateFromStorage(readStoredAuth()));
  }, [dispatch]);

  return null;
}
