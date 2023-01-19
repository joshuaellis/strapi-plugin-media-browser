import * as React from "react";

import { useGetAllFilesAtFolderQuery } from "../data/finderApi";

import { uploadAssetThunk } from "../modules/upload";

import { useTypedDispatch, useTypedSelector } from "../store/hooks";
import { selectUploadsBasedOnRoute } from "../store/selectors";
import { AssetGrid } from "./Grids/AssetGrid";

import { UploadDropzone } from "./Upload/UploadDropzone";

export const FileBrowser = () => {
  const uploads = useTypedSelector(selectUploadsBasedOnRoute);
  const dispatch = useTypedDispatch();

  const { data: files = [] } = useGetAllFilesAtFolderQuery("");

  const handleFileDrop = async (files: File[]) => {
    await Promise.all(
      files.map(async (file) => {
        await dispatch(uploadAssetThunk(file));
      })
    );
  };

  const cards = [...uploads, ...files];

  console.log(cards);

  return (
    <UploadDropzone onFileDrop={handleFileDrop}>
      {cards.length === 0 ? "No files found." : <AssetGrid cards={cards} />}
    </UploadDropzone>
  );
};
