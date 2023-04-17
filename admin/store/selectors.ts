import { createSelector, type Selector } from '@reduxjs/toolkit';

import type { RootState } from './store';
import { fileApi, makeGetAllFilesQuery } from '../data/fileApi';

const createTypedSelector = <TResult>(selector: Selector<RootState, TResult>) =>
  createSelector((state: RootState) => state, selector);

export const selectUploadsBasedOnRoute = createTypedSelector((state) => {
  const currentPlace = state.finder.currentPlace?.name ?? 'root';
  const uploadsByRoute = state.upload.currentUploads[currentPlace];

  return uploadsByRoute ? Object.values(uploadsByRoute) : [];
});

export const selectSelectedItemsWithTags = (query: URLSearchParams) =>
  createTypedSelector((state) => {
    const selectedItemUUUIDs = state.finder.selectedItems;

    const folder = state.finder.currentPlace;

    const fileQuery = makeGetAllFilesQuery(folder, query.get('sortBy'));

    const { data = [] } = fileApi.endpoints.getAllFiles.select(fileQuery)(state);

    return data
      .filter((file) => selectedItemUUUIDs.includes(file.uuid))
      .map(({ uuid, tags }) => ({ uuid, tags: tags.flatMap((tag) => tag.uuid) }));
  });
