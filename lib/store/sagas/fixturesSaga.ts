import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchFixturesMock } from "@/lib/mock/events";
import { toastAdded } from "@/lib/store/toastSlice";
import {
  fixturesFailed,
  fixturesRequested,
  fixturesSucceeded,
} from "@/lib/store/fixturesSlice";

function* fixturesWorker(action: PayloadAction<{ date?: string } | undefined>) {
  const date = action.payload?.date ?? null;

  try {
    const items: Awaited<ReturnType<typeof fetchFixturesMock>> = yield call(
      fetchFixturesMock,
      date ?? undefined
    );
    yield put(fixturesSucceeded({ date, items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load fixtures.";
    yield put(fixturesFailed({ date, message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

export function* fixturesSaga() {
  yield takeLatest(fixturesRequested.type, fixturesWorker);
}
