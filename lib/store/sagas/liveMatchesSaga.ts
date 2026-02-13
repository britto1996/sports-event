import { call, put, takeLatest } from "redux-saga/effects";
import { fetchLiveMatchesMock } from "@/lib/mock/events";
import { toastAdded } from "@/lib/store/toastSlice";
import {
  liveMatchesFailed,
  liveMatchesRequested,
  liveMatchesSucceeded,
} from "@/lib/store/liveMatchesSlice";

function* liveMatchesWorker() {
  try {
    const items: Awaited<ReturnType<typeof fetchLiveMatchesMock>> = yield call(fetchLiveMatchesMock);
    yield put(liveMatchesSucceeded({ items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load live matches.";
    yield put(liveMatchesFailed({ message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

export function* liveMatchesSaga() {
  yield takeLatest(liveMatchesRequested.type, liveMatchesWorker);
}
