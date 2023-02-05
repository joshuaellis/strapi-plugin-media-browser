import * as React from "react";

import { MediaFile } from "../data/fileApi";

import { uploadAssetThunk, deleteUploadItems } from "../modules/upload";
import { addSelectedItem, replaceSelectedItems } from "../modules/finder";

import { useTypedDispatch, useTypedSelector } from "../store/hooks";
import { selectUploadsBasedOnRoute } from "../store/selectors";

import { CardAssetProps } from "./Cards/CardAsset";
import { AssetGrid } from "./Grids/AssetGrid";
import { UploadDropzone } from "./Upload/UploadDropzone";

interface FileBrowserProps {
  files: MediaFile[];
}

export const FileBrowser = ({ files }: FileBrowserProps) => {
  const uploads = useTypedSelector(selectUploadsBasedOnRoute);
  const folder = useTypedSelector((state) => state.finder.currentPlace);
  const dispatch = useTypedDispatch();
  const abortRefs = React.useRef<Map<string, () => void>>(new Map());

  const handleFileDrop = async (files: File[]) => {
    await Promise.all(
      files.map(async (file) => {
        const promise = dispatch(uploadAssetThunk({ file, folder }));

        /**
         * Add the abort function to the map so we can call it later
         */
        abortRefs.current.set(file.name, promise.abort);

        /**
         * Remove the abort function from the map once the upload thunk
         * has completed regardless of the outcome.
         */
        promise.finally(() => {
          abortRefs.current.delete(file.name);
        });
      })
    );
  };

  const handleAbortUpload = (name: string) => {
    abortRefs.current.get(name)?.();
  };

  const handleCardSelect: Pick<CardAssetProps, "onClick">["onClick"] = (
    uuid,
    event
  ) => {
    if (event.shiftKey) {
      dispatch(addSelectedItem(uuid));
    } else {
      dispatch(replaceSelectedItems(uuid));
    }
  };

  const handleContainerClick = () => {
    dispatch(replaceSelectedItems());
  };

  React.useLayoutEffect(() => {
    /**
     * Find any items that are in both uploads and files
     */
    const itemsToRemove = uploads.filter((upload) =>
      files.some((file) => file.hash === upload.hash)
    );

    if (itemsToRemove.length > 0) {
      dispatch(deleteUploadItems(itemsToRemove));
    }
  }, [files, uploads]);

  const cards = [...uploads, ...files];

  return (
    <UploadDropzone onFileDrop={handleFileDrop}>
      {cards.length === 0 ? (
        "No files found."
      ) : (
        <AssetGrid
          cards={cards}
          onContainerClick={handleContainerClick}
          onCancelClick={handleAbortUpload}
          onCardSelect={handleCardSelect}
        />
      )}
    </UploadDropzone>
  );
};
