import { createSelector, type Selector } from '@reduxjs/toolkit';

import type { RootState } from './store';

const createTypedSelector = <TResult>(selector: Selector<RootState, TResult>) =>
  createSelector((state: RootState) => state, selector);

export const selectUploadsBasedOnRoute = createTypedSelector((state) => {
  const uploadsByRoute = state.upload.currentUploads[state.finder.currentPlace];

  return uploadsByRoute ? Object.values(uploadsByRoute) : [];
});
