import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const cacheInitialState = {
  fetchedSubjectsFromProfile: {} as Record<string, number>,
};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState: cacheInitialState,
  reducers: {
    setSubjectCache(state, payload: PayloadAction<{ id: string }>) {
      state.fetchedSubjectsFromProfile[payload.payload.id] =
        new Date().getTime();
    },
    setBulkSubjectsCache(
      state,
      payload: PayloadAction<Record<string, number>>,
    ) {
      state.fetchedSubjectsFromProfile = {
        ...state.fetchedSubjectsFromProfile,
        ...payload.payload,
      };
    },
  },
});

export const { setBulkSubjectsCache, setSubjectCache } = cacheSlice.actions;
