import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { uploadApi, UploadFileResponse } from "../data/uploadApi";

import { hashFile } from "../helpers/files";
import { generatePreviewBlobUrl } from "../helpers/images";

import { createTypedAsyncThunk } from "../store/middleware";

export interface UploadItem {
  assetType: "image" | "file" | "video";
  hash: string;
  name: string;
  size: number;
  status: "queued" | "uploading" | "complete";
  url?: string;
  percent?: number;
}

export interface UploadState {
  currentUploads: Record<string, Record<string, UploadItem>>;
}

const initialState: UploadState = {
  currentUploads: {},
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    previewReady(
      state,
      action: PayloadAction<{
        hash: string;
        previewUrl: string;
        folder: string;
      }>
    ) {
      const { hash, previewUrl, folder } = action.payload;
      state.currentUploads[folder][hash].url = previewUrl;
    },
    uploadStart(
      state,
      action: PayloadAction<{ uploadItem: UploadItem; folder: string }>
    ) {
      const { folder, uploadItem } = action.payload;
      state.currentUploads[folder][uploadItem.hash] = uploadItem;
    },
    createFolderInCurrentUploads(state, action: PayloadAction<string>) {
      const folder = action.payload;
      state.currentUploads[folder] = {};
    },
    // TODO: you should be able to cancel an upload
  },
  extraReducers(builder) {
    builder.addCase(uploadAssetThunk.rejected, (state, action) => {
      // TODO: handle upload failure

      console.log("FAILED UPLOAD");
    });
    builder.addCase(uploadAssetThunk.fulfilled, (state, action) => {
      console.log("FUFILLED", action.payload);

      if ("data" in action.payload) {
        const { data } = action.payload;
        let { hash, folder } = data;

        if (!folder) {
          folder = "root";
        }

        if (
          state.currentUploads[folder] &&
          state.currentUploads[folder][hash]
        ) {
          state.currentUploads[folder][hash].status = "complete";
        }
      } else if ("error" in action.payload) {
        // TODO: handle this error of the thunk
      }
    });
  },
});

export const uploadReducer = uploadSlice.reducer;

const { previewReady, uploadStart, createFolderInCurrentUploads } =
  uploadSlice.actions;

const UPLOAD_FILE_THUNK = "upload/asset";

export const uploadAssetThunk = createTypedAsyncThunk<
  { data: UploadFileResponse } | { error: unknown },
  File
>(UPLOAD_FILE_THUNK, async (file, { getState, dispatch }) => {
  const hash = await hashFile(file);

  const folder = getState().finder.currentPlace;

  const currentUploadsForFolder = getState().upload.currentUploads[folder];

  if (currentUploadsForFolder && currentUploadsForFolder[hash]) {
    return { error: "File already exists" };
  } else if (!currentUploadsForFolder) {
    dispatch(createFolderInCurrentUploads(folder));
  }

  /**
   * We distinguish between images and files because we want to be able to support
   * an image pipeline in the future.
   */
  const assetType =
    file.type.indexOf("image") >= 0
      ? "image"
      : file.type.indexOf("video") >= 0
      ? "video"
      : "file";

  const uploadItem: UploadItem = {
    assetType,
    hash,
    name: file.name,
    size: file.size,
    status: "queued",
  };

  /**
   * Setup the upload item in the store
   */
  dispatch(uploadStart({ uploadItem, folder }));

  const previewUrl = await generatePreviewBlobUrl(file);

  /**
   * Add a preview version of the URL for now to the store
   */
  dispatch(previewReady({ hash, previewUrl, folder }));

  const uploadAction = await dispatch(
    uploadApi.endpoints.uploadFile.initiate({
      file,
      fileInfo: {
        assetType,
        hash,
      },
    })
  );

  console.log("UPLOAD RES", uploadAction);

  return uploadAction;
});
