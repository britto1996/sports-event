import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginApi, registerApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  authFailed,
  authSucceeded,
  loginRequested,
  logoutRequested,
  registerRequested,
} from "@/lib/store/authSlice";
import { clearStoredAuth, writeStoredAuth } from "@/lib/authStorage";
import { toastAdded } from "@/lib/store/toastSlice";

function* loginWorker(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: Awaited<ReturnType<typeof loginApi>> = yield call(loginApi, action.payload);

    if (!result.token) {
      yield put(authFailed({ message: "Login succeeded but no token was returned." }));
      return;
    }

    yield call(writeStoredAuth, { token: result.token, email: result.email });
    yield put(authSucceeded({ token: result.token, email: result.email }));
    yield put(toastAdded({ type: "success", message: "Logged in successfully" }));
  } catch (err) {
    const msg = getApiErrorMessage(err);
    yield put(authFailed({ message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

function* registerWorker(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const result: Awaited<ReturnType<typeof registerApi>> = yield call(registerApi, action.payload);

    if (!result.token) {
      yield put(authFailed({ message: "Registration succeeded but no token was returned." }));
      return;
    }

    yield call(writeStoredAuth, { token: result.token, email: result.email });
    yield put(authSucceeded({ token: result.token, email: result.email }));
    yield put(toastAdded({ type: "success", message: "Account created successfully" }));
  } catch (err) {
    const msg = getApiErrorMessage(err);
    yield put(authFailed({ message: msg }));
    yield put(toastAdded({ type: "error", message: msg }));
  }
}

function* logoutWorker() {
  yield call(clearStoredAuth);
}

export function* authSaga() {
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(registerRequested.type, registerWorker);
  yield takeLatest(logoutRequested.type, logoutWorker);
}
