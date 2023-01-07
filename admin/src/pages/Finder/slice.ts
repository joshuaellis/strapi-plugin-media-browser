import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface FinderState {}

const initialState: FinderState = {};

export const finderSlice = createSlice({
  name: "finder",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function
export const {} = finderSlice.actions;

export default finderSlice.reducer;
