import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { TypedStartListening, TypedAddListener } from "@reduxjs/toolkit";
import { Dispatch, RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, Dispatch>;

export const startTypedListening =
  listenerMiddleware.startListening as AppStartListening;
