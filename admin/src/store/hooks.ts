import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { Dispatch, RootState } from "./store";

export const useTypedDispatch: () => Dispatch = useDispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
