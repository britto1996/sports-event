import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchFixtures } from "@/lib/api/events";
import { getApiErrorMessage } from "@/lib/api/client";
import { toastAdded } from "@/lib/store/toastSlice";
import {
  fixturesFailed,
  fixturesRequested,
  fixturesSucceeded,
} from "@/lib/store/fixturesSlice";

function* fixturesWorker(action: PayloadAction<{ date?: string } | undefined>) {
  const date = action.payload?.date ?? null;

  try {
    const items: Awaited<ReturnType<typeof fetchFixtures>> = yield call(fetchFixtures, date ?? undefined);
    yield put(fixturesSucceeded({ date, items }));
  } catch (err) {
    const msg = getApiErrorMessage(err);
    yield put(fixturesFailed({ date, message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

export function* fixturesSaga() {
  yield takeLatest(fixturesRequested.type, fixturesWorker);
}
