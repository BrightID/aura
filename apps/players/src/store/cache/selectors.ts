import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';

export const selectCachedProfiles = createSelector(
  (state: RootState) => state.cache,
  (cache) => cache.fetchedSubjectsFromProfile,
);
