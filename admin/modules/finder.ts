import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { MediaFile } from '../data/fileApi';
import { startTypedListening } from '../store/middleware';

export interface FinderState {
  folderHistory: string[];
  currentPlaceIndex: number;
  currentPlace: string;
  canGoForward: boolean;
  canGoBack: boolean;
  selectedItems: string[];
  fileDetails: MediaFile | null;
}

const initialState: FinderState = {
  folderHistory: [],
  currentPlaceIndex: 0,
  currentPlace: '',
  canGoForward: false,
  canGoBack: false,
  selectedItems: [],
  fileDetails: {
    uuid: 'sSUanV57UNd0MM_L74Unb',
    alternativeText: null,
    assetType: 'image',
    caption: null,
    createdAt: '2023-01-27T18:01:42.576Z',
    ext: '.webp',
    folder: null,
    folderPath: '/',
    hash: 'b09ccb6c6a74906f232e35e97759fe54c8dbe1e3',
    height: 973870125,
    id: 51,
    mime: 'image/webp',
    name: 'pizza.webp',
    previewUrl: null,
    provider: 'local',
    provider_metadata: null,
    tags: [
      {
        uuid: 'Bavt2VsbKeqGkZf0fpGf4',
      },
    ],
    size: 767.2,
    updatedAt: '2023-03-18T22:42:11.232Z',
    url: '/uploads/b09ccb6c6a74906f232e35e97759fe54c8dbe1e3.webp',
    width: 169424903,
  },
};

const finderSlice = createSlice({
  name: 'finder',
  initialState,
  reducers: {
    goBack(state) {
      const newIndex = state.currentPlaceIndex - 1;

      state.currentPlace = state.folderHistory[newIndex - 1];
      state.currentPlaceIndex = newIndex;
    },
    goForward(state) {
      const newIndex = state.currentPlaceIndex + 1;
      state.currentPlace = state.folderHistory[newIndex - 1];
      state.currentPlaceIndex = newIndex;
    },
    pushState(state, action: PayloadAction<string>) {
      if (state.currentPlaceIndex === state.folderHistory.length) {
        // add the new place
        state.folderHistory = [...state.folderHistory, action.payload];
      } else {
        // delete all the history after the current place and then add the new place
        state.folderHistory = [
          ...state.folderHistory.slice(0, state.currentPlaceIndex),
          action.payload,
        ];
      }

      state.currentPlace = action.payload;
      state.currentPlaceIndex += 1;
    },
    setAbilityToNavigate(
      state,
      action: PayloadAction<{ canGoForward: boolean; canGoBack: boolean }>
    ) {
      state.canGoForward = action.payload.canGoForward;
      state.canGoBack = action.payload.canGoBack;
    },
    addSelectedItem(state, action: PayloadAction<string>) {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems = [...state.selectedItems, action.payload];
      }
    },
    replaceSelectedItems(state, action: PayloadAction<string | undefined>) {
      if (!action.payload) {
        state.selectedItems = [];
        return;
      }

      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems = [action.payload];
      }
    },
    removeSelectedItem(state, action: PayloadAction<string>) {
      state.selectedItems = state.selectedItems.filter((item) => item !== action.payload);
    },
    showFileDetails(state, action: PayloadAction<MediaFile>) {
      state.fileDetails = action.payload;
    },
    hideFileDetails(state) {
      state.fileDetails = null;
    },
  },
});

export const finderReducer = finderSlice.reducer;

// Action creators are generated for each case reducer function
export const {
  goBack,
  goForward,
  pushState,
  addSelectedItem,
  removeSelectedItem,
  replaceSelectedItems,
  showFileDetails,
  hideFileDetails,
} = finderSlice.actions;

/**
 * A little overengineered, but interesting to try out listeners.
 */
startTypedListening({
  predicate: (_, currentState, previousState) => {
    // Trigger logic after every action if this condition is true
    return currentState.finder.currentPlaceIndex !== previousState.finder.currentPlaceIndex;
  },
  effect: (_, api) => {
    const { currentPlaceIndex, folderHistory } = api.getState().finder;

    const payload = {
      canGoBack: false,
      canGoForward: false,
    };

    if (currentPlaceIndex > 1 && folderHistory.length > 1) {
      payload.canGoBack = true;
    }

    if (currentPlaceIndex < folderHistory.length && folderHistory.length > 1) {
      payload.canGoForward = true;
    }

    api.dispatch(finderSlice.actions.setAbilityToNavigate(payload));
  },
});
