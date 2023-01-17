import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { startTypedListening } from "../store/middleware";

export interface FinderState {
  folderHistory: string[];
  currentPlaceIndex: number;
  currentPlace: string;
  canGoForward: boolean;
  canGoBack: boolean;
}

const initialState: FinderState = {
  folderHistory: [],
  currentPlaceIndex: 0,
  currentPlace: "",
  canGoForward: false,
  canGoBack: false,
};

export const finderSlice = createSlice({
  name: "finder",
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
  },
});

export const finderReducer = finderSlice.reducer;

// Action creators are generated for each case reducer function
export const { goBack, goForward, pushState } = finderSlice.actions;

/**
 * A little overengineered, but interesting to try out listeners.
 */
startTypedListening({
  predicate: (_, currentState, previousState) => {
    // Trigger logic after every action if this condition is true
    return (
      currentState.finder.currentPlaceIndex !==
      previousState.finder.currentPlaceIndex
    );
  },
  effect: (_, api) => {
    const { currentPlaceIndex, folderHistory } = api.getState().finder;

    let payload = {
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
