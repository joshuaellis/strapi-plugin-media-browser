import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { Dispatch, RootState } from './store';

export const useTypedDispatch: () => Dispatch = useDispatch;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
