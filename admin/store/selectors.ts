import { createSelector, type Selector } from '@reduxjs/toolkit';

import type { RootState } from './store';
import { fileApi } from '../data/fileApi';

const createTypedSelector = <TResult>(selector: Selector<RootState, TResult>) =>
  createSelector((state: RootState) => state, selector);

export const selectUploadsBasedOnRoute = createTypedSelector((state) => {
  const uploadsByRoute = state.upload.currentUploads[state.finder.currentPlace];

  return uploadsByRoute ? Object.values(uploadsByRoute) : [];
});

export const selectSelectedItemsWithTags = (query: URLSearchParams) =>
  createTypedSelector((state) => {
    const selectedItemUUUIDs = state.finder.selectedItems;

    const folder = state.finder.currentPlace;

    const { data = [] } = fileApi.endpoints.getAllFilesAtFolder.select({
      folder: folder === 'root' ? '' : folder,
      sortBy: query.get('sortBy') ?? 'none',
    })(state);

    return data
      .filter((file) => selectedItemUUUIDs.includes(file.uuid))
      .map(({ uuid, tags }) => ({ uuid, tags: tags.flatMap((tag) => tag.uuid) }));
  });
