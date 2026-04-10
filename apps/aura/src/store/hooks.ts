import {
  TypedUseSelectorHook,
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
} from 'react-redux';
import { AppDispatch, RootState } from 'store';

export const useDispatch = () => originalUseDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = originalUseSelector;
