import { configureStore } from "@reduxjs/toolkit";

import { finderReducer } from "../modules/finder";
import { uploadReducer } from "../modules/upload";

import { strapiAdminApi } from "./api";
import { listenerMiddleware } from "./middleware";

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [strapiAdminApi.reducerPath]: strapiAdminApi.reducer,
    finder: finderReducer,
    upload: uploadReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(strapiAdminApi.middleware),
});

export type CreatedStore = typeof store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<CreatedStore["getState"]>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type Dispatch = CreatedStore["dispatch"];
