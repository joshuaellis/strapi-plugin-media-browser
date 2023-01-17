import * as React from "react";
import { uploadAssetThunk } from "../modules/upload";
import { useTypedDispatch, useTypedSelector } from "../store/hooks";
import { selectUploadsBasedOnRoute } from "../store/selectors";

import { UploadDropzone } from "./Upload/UploadDropzone";

export const FileBrowser = () => {
  const uploads = useTypedSelector(selectUploadsBasedOnRoute);
  const dispatch = useTypedDispatch();

  const handleFileDrop = async (files: File[]) => {
    await Promise.all(
      files.map(async (file) => {
        await dispatch(uploadAssetThunk(file));
      })
    );

    console.log("finished");
    debugger;
  };

  return (
    <UploadDropzone onFileDrop={handleFileDrop}>No files found.</UploadDropzone>
  );
};
