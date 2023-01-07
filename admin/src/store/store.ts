import { configureStore, ReducersMapObject } from "@reduxjs/toolkit";
import { strapiAdminApi } from "./api";

export const createStore = (reducers: ReducersMapObject = {}) =>
  configureStore({
    reducer: {
      // Add the generated reducer as a specific top-level slice
      [strapiAdminApi.reducerPath]: strapiAdminApi.reducer,
      ...reducers,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(strapiAdminApi.middleware),
  });

export type CreatedStore = ReturnType<typeof createStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<CreatedStore["getState"]>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type Dispatch = CreatedStore["dispatch"];
