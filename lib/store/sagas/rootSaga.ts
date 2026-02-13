import { all, fork } from "redux-saga/effects";
import { authSaga } from "@/lib/store/sagas/authSaga";
import { fixturesSaga } from "@/lib/store/sagas/fixturesSaga";
import { liveMatchesSaga } from "@/lib/store/sagas/liveMatchesSaga";

export function* rootSaga() {
  yield all([fork(authSaga), fork(fixturesSaga), fork(liveMatchesSaga)]);
}
