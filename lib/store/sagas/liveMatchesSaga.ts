import { call, put, takeLatest } from "redux-saga/effects";
import { fetchLiveMatches } from "@/lib/api/events";
import { getApiErrorMessage } from "@/lib/api/client";
import { toastAdded } from "@/lib/store/toastSlice";
import {
  liveMatchesFailed,
  liveMatchesRequested,
  liveMatchesSucceeded,
} from "@/lib/store/liveMatchesSlice";

function* liveMatchesWorker() {
  try {
    const items: Awaited<ReturnType<typeof fetchLiveMatches>> = yield call(fetchLiveMatches);
    yield put(liveMatchesSucceeded({ items }));
  } catch (err) {
    const msg = getApiErrorMessage(err);
    yield put(liveMatchesFailed({ message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

export function* liveMatchesSaga() {
  yield takeLatest(liveMatchesRequested.type, liveMatchesWorker);
}
